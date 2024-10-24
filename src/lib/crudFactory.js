const httpStatus = require('http-status');
// eslint-disable-next-line no-unused-vars
const {FilterQuery, PopulateOptions, UpdateQuery, Model} = require('mongoose');

const ApiError = require('../utils/ApiError');

/**
 * A factory class for CRUD operations with a Mongoose model.
 * @template TRaw - The type of the raw document.
 * @template TMethods - The type of additional methods for the model (default is object).
 */
class CrudFactory {
  /**
   * @param {Model<TRaw, object, TMethods>} mongooseModel - The Mongoose model to use.
   * @param {string} entityName - The name of the entity.
   */
  constructor(mongooseModel, entityName) {
    this.Model = mongooseModel;
    this.entityName = entityName;
  }

  /**
   * Retrieves multiple documents based on filters.
   * @param {FilterQuery<TRaw>} filters - The filters to apply.
   * @param {PopulateOptions | PopulateOptions[] | null} [populateOptions=null] - The populate options.
   * @param {(query: mongoose.Query<any, TRaw>) => mongoose.Query<any, TRaw>} [queryModifier] - A function that receives the result of `Model.find()` and returns the modified query.
   * @returns {Promise<TRaw[]>} - A promise that resolves to an array of documents.
   */
  async getMany(filters, populateOptions = null, queryModifier) {
    let query = this.Model.find(filters);
    if (queryModifier) query = queryModifier(query);
    if (populateOptions) query.populate(populateOptions);
    return query;
  }

  /**
   * Retrieves paginated documents based on filters.
   * @param {FilterQuery<TRaw>} filters - The filters to apply.
   * @param {PaginateOptions} options - The pagination options.
   * @returns {Promise<any>} - A promise that resolves to a paginated result.
   */
  async getManyPaginated(filters, options) {
    return this.Model.paginate(filters, options);
  }

  /**
   * Creates a new document.
   * @param {Partial<TRaw> & { _id?: MongoObjectId }} data - The data for the new document.
   * @returns {Promise<TRaw>} - A promise that resolves to the created document.
   */
  async create(data) {
    const doc = await this.Model.create(data);
    return doc;
  }

  /**
   * Retrieves a single document by its ID.
   * @param {MongoObjectId} id - The ID of the document.
   * @param {PopulateOptions | PopulateOptions[] | null} [populateOptions=null] - The populate options.
   * @param {boolean} [raiseNotFoundError=true] - Whether to raise an error if the document is not found.
   * @returns {Promise<TRaw>} - A promise that resolves to the document.
   * @throws {ApiError} - Throws an error if the document is not found and raiseNotFoundError is true.
   */
  async getOneById(id, populateOptions = null, raiseNotFoundError = true) {
    const query = this.Model.findById(id);
    if (populateOptions) query.populate(populateOptions);

    const doc = await query;
    if (!doc && raiseNotFoundError)
      throw new ApiError(`Could not find ${this.entityName} with id ${id}`, httpStatus.NOT_FOUND);

    return doc;
  }

  /**
   * Retrieves a single document based on filters.
   * @param {FilterQuery<TRaw>} filters - The filters to apply.
   * @param {PopulateOptions | PopulateOptions[] | null} [populateOptions=null] - The populate options.
   * @param {boolean} [raiseNotFoundError=true] - Whether to raise an error if the document is not found.
   * @returns {Promise<TRaw>} - A promise that resolves to the document.
   * @throws {ApiError} - Throws an error if the document is not found and raiseNotFoundError is true.
   */
  async getOne(filters, populateOptions = null, raiseNotFoundError = true) {
    const query = this.Model.findOne(filters);
    if (populateOptions) query.populate(populateOptions);

    const doc = await query;
    if (!doc && raiseNotFoundError)
      throw new ApiError(`Could not find ${this.entityName} with the given filters`, httpStatus.NOT_FOUND);

    return doc;
  }

  /**
   * Updates a single document by its ID.
   * @param {MongoObjectId} id - The ID of the document.
   * @param {UpdateQuery<TRaw>} data - The update data.
   * @param {(query: mongoose.Query<any, TRaw>) => mongoose.Query<any, TRaw>} [queryModifier] - A function that receives the result of `Model.find()` and returns the modified query.
   * @returns {Promise<TRaw>} - A promise that resolves to the updated document.
   * @throws {ApiError} - Throws an error if the document is not found.
   */
  async updateOneById(id, data, queryModifier) {
    let query = this.Model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (queryModifier) query = queryModifier(query);

    const doc = await query;
    if (!doc) throw new ApiError(`Could not find ${this.entityName} with id ${id}`, httpStatus.NOT_FOUND);
    return doc;
  }

  /**
   * Updates a single document based on filters.
   * @param {FilterQuery<TRaw>} filters - The filters to apply.
   * @param {UpdateQuery<TRaw>} data - The update data.
   * @returns {Promise<TRaw>} - A promise that resolves to the updated document.
   * @throws {ApiError} - Throws an error if the document is not found.
   */
  async updateOne(filters, data) {
    const doc = await this.Model.findOneAndUpdate(filters, data, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new ApiError(`Could not find ${this.entityName} with the given filters`, httpStatus.NOT_FOUND);
    return doc;
  }

  /**
   * Upserts a single document based on filters.
   * @param {FilterQuery<TRaw>} filters - The filters to apply.
   * @param {UpdateQuery<TRaw>} data - The update data.
   * @returns {Promise<TRaw>} - A promise that resolves to the upserted document.
   * @throws {ApiError} - Throws an error if the document is not found.
   */
  async upsertOne(filters, data = {}) {
    const doc = await this.Model.findOneAndUpdate(filters, data, {
      new: true,
      runValidators: true,
      upsert: true,
    });
    if (!doc) throw new ApiError(`Could not find ${this.entityName} with the given filters`, httpStatus.NOT_FOUND);
    return doc;
  }

  /**
   * Updates multiple documents based on filters.
   * @param {FilterQuery<TRaw>} filters - The filters to apply.
   * @param {UpdateQuery<TRaw>} data - The update data.
   * @returns {Promise<any>} - A promise that resolves to the update result.
   */
  async updateMany(filters, data) {
    return this.Model.updateMany(filters, data);
  }

  /**
   * Deletes a single document by its ID.
   * @param {MongoObjectId} id - The ID of the document.
   * @param {(query: mongoose.Query<any, TRaw>) => mongoose.Query<any, TRaw>} [queryModifier] - A function that receives the result of `Model.find()` and returns the modified query.
   * @returns {Promise<TRaw>} - A promise that resolves to the deleted document.
   * @throws {ApiError} - Throws an error if the document is not found.
   */
  async deleteOneById(id, queryModifier) {
    let query = this.Model.findByIdAndDelete(id);
    if (queryModifier) query = queryModifier(query);
    const doc = await query;
    if (!doc) throw new ApiError(`Could not find ${this.entityName} with id ${id}`, httpStatus.NOT_FOUND);
    return doc;
  }

  /**
   * Deletes a single document based on filters.
   * @param {FilterQuery<TRaw>} filters - The filters to apply.
   * @returns {Promise<TRaw>} - A promise that resolves to the deleted document.
   * @throws {ApiError} - Throws an error if the document is not found.
   */
  async deleteOne(filters) {
    const doc = await this.Model.findOneAndDelete(filters);
    if (!doc) throw new ApiError(`Could not find ${this.entityName} with the given filters`, httpStatus.NOT_FOUND);
    return doc;
  }

  /**
   * Deletes multiple documents based on filters.
   * @param {FilterQuery<TRaw>} filters - The filters to apply.
   * @returns {Promise<any>} - A promise that resolves to the delete result.
   */
  async deleteMany(filters) {
    return this.Model.deleteMany(filters);
  }

  /**
   * Counts documents based on filters.
   * @param {FilterQuery<TRaw>} filters - The filters to apply.
   * @returns {Promise<number>} - A promise that resolves to the count of documents.
   */
  async countDocuments(filters) {
    return this.Model.countDocuments(filters);
  }
}

module.exports = CrudFactory;
