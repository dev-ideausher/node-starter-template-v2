const Paystack = require('@paystack/paystack-sdk');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const config = require('../config/config');
const {Customer} = require('../models');
const paystack = new Paystack(config.paystack.secretKey);

async function findCustomerByUserId(userId) {
  return Customer.findOne({user: userId}).populate('user');
}

async function getSubscriptionById(id) {
  try {
    const res = await paystack.subscription.fetch({code: id});
    if (!res.status) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to get subsciption details');
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
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create customer');
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
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to cancel subscription');
    }
    return true;
  } catch (err) {
    console.log('🚀 ~ cancelSubscriptionById ~ err:', err);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Unable to cancel subscription');
  }
}
module.exports = {
  getPlans,
  getPlanByCode,
  getSubscriptionById,
  purchaseSubscription,
  getSubscriptionsOfUser,
  cancelSubscriptionById,
};
