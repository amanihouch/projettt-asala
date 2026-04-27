// backend/src/utils/catchAsync.js

/**
 * Wrapper pour capturer les erreurs dans les contrôleurs async
 * Évite d'avoir à utiliser try/catch dans chaque contrôleur
 * @param {Function} fn - La fonction du contrôleur
 * @returns {Function} - La fonction wrappée
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;