const {default: mongoose} = require('mongoose');

const paginate = schema => {
  schema.statics.paginate = async function(filters, options, geoFilters = null) {
    // defining pipeline
    const pipeline = [];
    if (geoFilters) {
      const {longitude, latitude, radius = 1} = geoFilters;
      pipeline.push({
        $geoNear: {
          near: {type: 'Point', coordinates: [longitude, latitude]},
          distanceField: 'dist.calculated',
          maxDistance: 1609.34 * radius,
          key: 'location',
        },
      });
    }
    // sepearte post populate filters from initial filters
    const {postPopulateFilters, ...initialFilters} = filters;
    // filtering the docs as per the provided filters
    pipeline.push({$match: initialFilters || {}});

    // defining the limit that user is requesting
    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    // defining the page or offset user is requesting
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    // defining the skip count that user is requesting
    const skip = (page - 1) * limit;

    // defining the Pipeline that documents has to go through
    let docsPipeline = [...pipeline, ...(options.pipeline || [])];

    // adding location based search filters if given by user

    // populating the fields if requested by user
    if (options.populate) {
      // pattern is `path::select1,select2:matchCondition2,select3`[]
      // e.g. "createdBy::name:tushar,email" => "createdBy::name:tushar,email"
      // converting to array if option is given in form of string
      const populateOptions = Array.isArray(options.populate) ? options.populate : [options.populate];
      // iterating over the populate options
      populateOptions.forEach(populateOption => {
        const matchObj = {};
        // seperating the path and fields that has to be selected from the the reffered collection
        const [path, select] = populateOption.split('::');
        // getting the name of collection where the field is referring to
        const collectionName = mongoose.model(this.schema.obj[path].ref).collection.name;
        let isMatchRequested = false;
        // iterating over the fields that has to be selected
        const selectFields =
          select === '*'
            ? Object.keys(mongoose.model(this.schema.obj[path].ref).schema.obj)
            : select.split(',').map(ele => {
                // seperating the requested select field from its match condition
                // e.g. i want name field but its value should match with pattern "Manish"
                // meaning extract documents from THIS collection who has "Manish" in the name field of the REFFERED collection
                const [name, match] = ele.split(':');
                // storing requested pattern match for a specific field
                if (match) {
                  matchObj[name] = match;
                  isMatchRequested = true;
                }
                return name;
              });

        // defining lookup for the current path
        const lookup = {
          $lookup: {
            from: collectionName,
            localField: path,
            foreignField: '_id',
            as: path,
            ...(Object.keys(matchObj).length > 0
              ? {
                  pipeline: [
                    // pipeline if there are any matches has to be performed
                    {
                      $match: {
                        $or: Object.keys(matchObj).map(key => ({
                          [key]: new RegExp(matchObj[key], 'i'),
                        })),
                      },
                    },
                  ],
                }
              : {}),
          },
        };
        // pushing this in docsPipeline
        docsPipeline.push(lookup);
        // check if the document is selected or not by the lookup
        // if it is populate the requested select fields into the current document i.e. ROOT
        // if not the set document to empty so that we can exclude it
        docsPipeline.push({
          $replaceRoot: {
            newRoot: {
              $cond: {
                if: {$gte: [{$size: `$${path}`}, 0]},
                then: {
                  $mergeObjects: [
                    '$$ROOT',
                    {
                      [path]: {
                        $map: {
                          input: `$${path}`,
                          as: 'element',
                          in: {
                            $mergeObjects: [
                              ...selectFields.map(field => ({
                                [field]: `$$element.${field}`,
                              })),
                              {_id: '$$element._id'},
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
                else: {},
              },
            },
          },
        });
        // applying filter to exclude the document if match was applied
        // and if the above step hasn't populated the fields
        if (isMatchRequested) {
          docsPipeline.push({
            $match: {
              $expr: {
                $ne: ['$$ROOT', {}],
              },
            },
          });
        }
      });
      if (postPopulateFilters) {
        docsPipeline.push({
          $match: postPopulateFilters,
        });
      }
    }

    if (options.project) {
      docsPipeline.push({$project: {...options.project}});
    }
    // defining the sort order and sort field
    const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
    const sortField = options.sortBy ? options.sortBy : 'createdAt';

    // calculating the total count of docs we got from the defined pipeline
    const countPipeline = [...docsPipeline];
    // applying the defined limit, sort and skip
    docsPipeline.push({$sort: {[sortField]: sortOrder}});
    docsPipeline.push({$skip: skip}, {$limit: limit});

    // pushing the totalCount for allowing pagination
    countPipeline.push({$count: 'totalResults'});

    // to retrieve the value of total count
    const countPromise = this.aggregate(countPipeline).exec();

    // to execute the pipeline
    const docsPromise = this.aggregate(docsPipeline).exec();

    // resolving the promises
    return Promise.all([countPromise, docsPromise]).then(values => {
      // seperating the counts and resulted docs
      const [counts, results] = values;
      const {totalResults = 0} = counts.length > 0 ? counts[0] : {};
      // defining total pages based on total results and limit
      const totalPages = Math.ceil(totalResults / limit);
      const result = {
        page,
        limit,
        results,
        totalPages,
        totalResults,
      };
      return result;
    });
  };
};

module.exports = {paginate};
