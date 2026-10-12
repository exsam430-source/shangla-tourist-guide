const successResponse = (res, statusCode = 200, message, data = null, meta = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;

  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) response.errors = errors;

  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, statusCode = 200, message, data, pagination) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      totalItems: pagination.total,
      itemsPerPage: pagination.limit,
      hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrevPage: pagination.page > 1,
    },
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };