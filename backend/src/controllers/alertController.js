const Alert = require('../models/Alert');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const getActiveAlerts = asyncHandler(async (req, res) => {
  const { severity, type } = req.query;

  const query = { isActive: true };
  if (severity) query.severity = severity;
  if (type) query.type = type;

  const alerts = await Alert.find(query)
    .sort('-createdAt')
    .populate('affectedPlaces', 'nameEn nameUr slug')
    .populate('reportedBy', 'name');

  return successResponse(res, 200, 'Active alerts fetched', alerts);
});

const getAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id)
    .populate('affectedPlaces', 'nameEn nameUr slug');

  if (!alert) {
    return errorResponse(res, 404, 'Alert not found');
  }

  return successResponse(res, 200, 'Alert fetched', alert);
});

const createAlert = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';

  const alertData = {
    ...req.body,
    reportedBy: req.user._id,
    reportedByType: isAdmin ? 'admin' : 'user',
    isVerified: isAdmin,
    isActive: isAdmin,
  };

  const alert = await Alert.create(alertData);

  const io = req.app.get('io');
  if (io && isAdmin) {
    io.emit('new_alert', alert);
  }

  return successResponse(
    res,
    201,
    isAdmin ? 'Alert created and published' : 'Alert reported. Admin will verify shortly.',
    alert
  );
});

const updateAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!alert) {
    return errorResponse(res, 404, 'Alert not found');
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('alert_updated', alert);
  }

  return successResponse(res, 200, 'Alert updated', alert);
});

const resolveAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    {
      isActive: false,
      resolvedAt: new Date(),
      resolvedNote: req.body.note,
    },
    { new: true }
  );

  if (!alert) {
    return errorResponse(res, 404, 'Alert not found');
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('alert_resolved', { alertId: alert._id });
  }

  return successResponse(res, 200, 'Alert resolved', alert);
});

const deleteAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findByIdAndDelete(req.params.id);

  if (!alert) {
    return errorResponse(res, 404, 'Alert not found');
  }

  return successResponse(res, 200, 'Alert deleted');
});

module.exports = {
  getActiveAlerts,
  getAlert,
  createAlert,
  updateAlert,
  resolveAlert,
  deleteAlert,
};