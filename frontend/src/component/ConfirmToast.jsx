const ConfirmToast = ({icon, title, message, onConfirm, onCancel, confirmText, cancelText}) => {
  return (
    <div
      dir="rtl"
      className="w-[320px]  p-6 flex flex-col items-center text-center gap-4"
    >
      {/* Icon */}
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900">
        {title}
      </h3>

      {/* Message */}
      <p className="text-sm text-gray-500 leading-relaxed">
        {message}
        <br />
        هذا الإجراء لا يمكن التراجع عنه.
      </p>

      {/* Actions */}
      <div className="flex gap-3 mt-2 w-full">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          {cancelText}
        </button>

        <button
          onClick={onConfirm}
          className="flex-1 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};

export default ConfirmToast;
