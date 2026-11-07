interface NoticeProps {
  message: string;
  variant?: 'error' | 'success';
}

export function Notice({ message, variant = 'error' }: NoticeProps) {
  let role: 'alert' | 'status' = 'status';

  if (variant === 'error') {
    role = 'alert';
  }

  return (
    <div className={'notice notice-' + variant} role={role}>
      {message}
    </div>
  );
}
