export function getStatusColor(status) {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'PENDING_PAYMENT':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-surface/5 text-surface/60 border-surface/10';
  }
}

export function getStatusText(status) {
  switch (status) {
    case 'PAID':
      return 'Pagado';
    case 'PENDING_PAYMENT':
      return 'Pendiente';
    case 'CANCELLED':
      return 'Cancelado';
    case 'SHIPPED':
      return 'Enviado';
    default:
      return status;
  }
}

export function getStatusDisplay(orderStatus, paymentStatus) {
  if (orderStatus === 'SHIPPED') {
    return {
      text: 'Orden Enviada',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      icon: 'local_shipping',
    };
  }

  if (paymentStatus === 'success' || orderStatus === 'PAID') {
    return {
      text: 'Pago Exitoso',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      icon: 'check_circle',
    };
  }

  if (paymentStatus === 'pending' || orderStatus === 'PENDING_PAYMENT') {
    return {
      text: 'Pago Pendiente',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      icon: 'schedule',
    };
  }

  if (paymentStatus === 'failure' || orderStatus === 'CANCELLED') {
    return {
      text: 'Pago Rechazado',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      icon: 'cancel',
    };
  }

  return {
    text: 'Estado Desconocido',
    bgColor: 'bg-surface/5',
    borderColor: 'border-surface/10',
    textColor: 'text-surface/60',
    icon: 'help',
  };
}

export function getStatusMessage(orderStatus, paymentStatus, shippedDate) {
  if (orderStatus === 'SHIPPED')
    return `Tu orden fue enviada el ${shippedDate}. Deberías recibirla pronto.`;
  if (orderStatus === 'PAID')
    return 'Tu pago fue exitoso. Tu orden está siendo preparada y será enviada pronto.';
  if (orderStatus === 'PENDING_PAYMENT')
    return 'Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.';
  if (orderStatus === 'CANCELLED')
    return 'No pudimos procesar tu pago. Por favor, intenta de nuevo.';
  if (paymentStatus === 'success') return 'Tu pago fue exitoso.';
  if (paymentStatus === 'pending') return 'Tu pago está siendo procesado.';
  if (paymentStatus === 'failure')
    return 'No pudimos procesar tu pago. Por favor, intenta de nuevo.';
  return '';
}
