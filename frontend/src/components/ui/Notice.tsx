interface NoticeProps {
  message: string;
  variant?: 'error' | 'success';
}

export function Notice({ message, variant = 'error' }: NoticeProps) {
  return (
    <div className={`notice notice-${variant}`} role={variant === 'error' ? 'alert' : 'status'}>
      {message}
    </div>
  );
}
