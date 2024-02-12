const Paystack = require('@paystack/paystack-sdk');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const {v4: uuidv4} = require('uuid');

const config = require('../config/config');
const {Customer, PaystackTransfer, User} = require('../models');
const paystack = new Paystack(config.paystack.secretKey);

async function findCustomerByUserId(userId) {
  return Customer.findOne({user: userId}).populate('user');
}

async function getSubscriptionById(id) {
  try {
    const res = await paystack.subscription.fetch({code: id});
    if (!res.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, response.message || 'Failed to get subsciption details');
    }
    return res.data;
  } catch (error) {
    console.log('🚀 ~ getSubscriptionById ~ error:', error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get subsciption details');
  }
}

async function getPlans() {
  const fetchPlansResponse = await paystack.plan.list({});
  if (!fetchPlansResponse || fetchPlansResponse.status === false) {
    console.log('🚀 ~ getPlans ~ fetchPlansResponse:', fetchPlansResponse, fetchPlansResponse.message);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to fetch plans');
  }
  return fetchPlansResponse.data;
}

async function getPlanByCode(code) {
  try {
    const res = await paystack.plan.fetch({code});
    if (!res.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to get plan');
    }
    return res.data;
  } catch (error) {
    console.log('🚀 ~ getPlanByCode ~ error:', error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get plan details');
  }
}

async function createCustomer(userId, fullName, email) {
  const [firstName, lastName = ''] = fullName.split(' ').slice(0, 2);
  try {
    const paystackCustomer = await paystack.customer.create({
      email,
      first_name: firstName,
      last_name: lastName,
    });
    if (!paystackCustomer.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, response.message || 'Failed to create customer');
    }

    const {id: customerId, customer_code: customerCode} = paystackCustomer.data;
    const customer = await Customer.create({
      user: userId,
      customerId,
      customerCode,
    });
    return customer;
  } catch (error) {
    console.log('🚀 ~ getSubscriptionById ~ error:', error);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to get create customer');
  }
}

async function getSubscriptionsOfUser(user) {
  const customer = await findCustomerByUserId(user._id);
  if (!customer) {
    return [];
  }
  let response = await paystack.subscription.list({
    customer: customer.customerId,
  });

  if (!response.status) {
    console.log('Error fetching subscriptions: ', fetchSubscriptionsResponse.message);
    throw new ApiError(httpStatus.BAD_REQUEST, `Failed to fetch subscriptions`);
  }
  return response.data
    .filter(subscription => subscription.status === 'active' || subscription.status === 'non-renewing')
    .map(
      ({status: subscription_status, id, start, email_token, amount, next_payment_date, createdAt, authorization}) => ({
        subscription_status,
        id,
        start,
        email_token,
        amount,
        next_payment_date,
        createdAt,
        authorization,
      })
    );
}
async function purchaseSubscription(user, planCode) {
  const customer = await findCustomerByUserId(user._id).then(async doc => {
    return doc ? doc : createCustomer(user._id, user.name, user.email);
  });
  const planDetails = await getPlanByCode(planCode);
  if (planDetails.is_deleted || planDetails.is_archived) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This Plan is not available for subscription');
  }
  let response;
  try {
    response = await paystack.transaction.initialize({
      email: customer.user.email,
      amount: planDetails.amount,
      plan: planDetails.plan_code,
      channels: ['card'],
    });
  } catch (err) {
    console.log('🚀 ~ purchaseSubscription ~ err:', err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unable to initialize transaction');
  }
  if (!response.status) {
    console.log('🚀 ~ purchaseSubscription ~ err:', response.message);
    throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to initialize transaction');
  }
  return response.data;
}

async function cancelSubscriptionById(id) {
  const data = await getSubscriptionById(id);
  const {email_token, subscription_code} = data;
  try {
    const response = await paystack.subscription.disable({
      code: subscription_code,
      token: email_token,
    });
    if (!response.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, response.message || 'Failed to cancel subscription');
    }
    return true;
  } catch (err) {
    console.log('🚀 ~ cancelSubscriptionById ~ err:', err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unable to cancel subscription');
  }
}

/* Only Nigerian banks */
async function createrRecipient(user, account_number, bank_code) {
  const customer = await findCustomerByUserId(user._id).then(async doc => {
    return doc ? doc : createCustomer(user._id, user.name, user.email);
  });

  try {
    const response = await paystack.transferrecipient.create({
      bank_code,
      account_number,
      name: user.name,
      type: 'nuban',
      currency: 'NGN',
    });
    if (!response.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, response.message || 'Failed to register the bank details');
    }
    const {bankDetails} = await Customer.findByIdAndUpdate(
      customer._id,
      {
        bankDetails: {
          recipientCode: response.data.recipient_code,
          name: user.name,
          accNo: account_number,
          bankCode: bank_code,
        },
      },
      {new: true}
    );
    return bankDetails;
  } catch (err) {
    console.log('🚀 ~ cancelSubscriptionById ~ err:', err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unable to register the bank details');
  }
}

async function sendMoneyToRecipient(userId, karmaPoints) {
  let customer = await findCustomerByUserId(userId);
  if (!customer) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please purchase subscription to redeem the points');
  }
  if (!customer.bankDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please register the bank details');
  }
  const params = {
    amount: karmaPoints * 50 * 100,
    source: 'balance',
    reference: uuidv4(),
    recipient: customer.bankDetails.recipientCode,
    // reason: 'Holiday Flexing',
  };
  let attempt = 0;
  const maxRetries = 3;
  while (attempt < maxRetries) {
    try {
      const response = await paystack.transfer.initiate(params);
      console.log('🚀 ~ sendMoneyToRecipient ~ response:', response);
      if (!response.status) {
        throw new ApiError(httpStatus.BAD_REQUEST, response.message || 'Failed to initialize the transfer');
      }
      const {id, transfer_code: transferCode, amount, reference, status, transferred_at: transferredAt} = response.data;
      await PaystackTransfer.create({
        id,
        status,
        amount,
        reference,
        karmaPoints,
        transferCode,
        transferredAt,
        user: customer.user,
        customer: customer._id,
      });
      return response.data;
    } catch (err) {
      console.log(`Attempt ${attempt + 1} failed:`, err);
      if (attempt === maxRetries - 1) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unable to initialize the transfer after maximum retries');
      }
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retrying
    }
  }
}

const verifyTransaction = async function(userId, transfer_code, otp) {
  try {
    const response = await paystack.transfer.finalize({
      transfer_code,
      otp,
    });
    if (!response.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, response.message);
    }

    await PaystackTransfer.findOneAndUpdate(
      {
        id: response.data.id,
      },
      {status: response.data.status},
      {new: true}
    ).then(async doc => {
      await User.findOneAndUpdate({_id: userId}, {$inc: {karmaPoints: -doc.karmaPoints}});
    });
    return response.data;
  } catch (err) {
    console.log('🚀 ~ verifyTransaction ~ err:', err);
    throw new ApiError(httpStatus.BAD_REQUEST, err.message);
  }
};

async function resendOTPForTransaction(transfer_code) {
  try {
    const response = await paystack.transfer.resendOtp({
      transfer_code,
      reason: 'transfer',
    });
    if (!response.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, response.message || 'Failed to resent the otp');
    }
    return response.data;
  } catch (err) {
    console.log('🚀 ~ resendOTPForTransaction ~ err:', err);
    throw new ApiError(httpStatus.BAD_REQUEST, err.message);
  }
}

async function getBankDetails(userId) {
  return Customer.findOne({user: userId});
}


module.exports = {
  getPlans,
  getPlanByCode,
  getBankDetails,
  createrRecipient,
  verifyTransaction,
  getSubscriptionById,
  sendMoneyToRecipient,
  purchaseSubscription,
  getSubscriptionsOfUser,
  cancelSubscriptionById,
  resendOTPForTransaction,
};
