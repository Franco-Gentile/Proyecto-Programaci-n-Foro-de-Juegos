function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  minLength,
  autoComplete,
  required = false,
}) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label-custom">
        {label}
      </label>
      <input
        type={type}
        className="form-control form-control-custom"
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        minLength={minLength}
        autoComplete={autoComplete}
        required={required}
      />
    </div>
  );
}

export default FormField;
