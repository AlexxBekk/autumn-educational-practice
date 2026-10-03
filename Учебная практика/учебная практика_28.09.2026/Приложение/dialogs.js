const DIALOG_KINDS = {
  error: { title: 'Ошибка', icon: '/resources/dialog-error.svg', confirmLabel: 'Понятно' },
  warning: { title: 'Предупреждение', icon: '/resources/dialog-warning.svg', confirmLabel: 'Выйти без сохранения' },
  info: { title: 'Информация', icon: '/resources/dialog-info.svg', confirmLabel: 'Продолжить' },
};

function buildDialog(kind, message, withCancel) {
  const settings = DIALOG_KINDS[kind];
  const dialog = document.createElement('dialog');
  dialog.className = `dialog dialog--${kind}`;
  const icon = document.createElement('img');
  icon.className = 'dialog__icon';
  icon.src = settings.icon;
  icon.alt = settings.title;
  const title = document.createElement('h2');
  title.className = 'dialog__title';
  title.textContent = settings.title;
  const text = document.createElement('p');
  text.className = 'dialog__message';
  text.textContent = message;
  const confirmButton = document.createElement('button');
  confirmButton.className = 'button button--primary';
  confirmButton.textContent = settings.confirmLabel;
  confirmButton.value = 'confirm';
  const actions = document.createElement('div');
  actions.className = 'dialog__actions';
  if (withCancel) {
    const cancelButton = document.createElement('button');
    cancelButton.className = 'button';
    cancelButton.textContent = 'Остаться на форме';
    cancelButton.value = 'cancel';
    cancelButton.addEventListener('click', () => dialog.close('cancel'));
    actions.append(cancelButton);
  }
  confirmButton.addEventListener('click', () => dialog.close('confirm'));
  actions.append(confirmButton);
  const header = document.createElement('div');
  header.className = 'dialog__header';
  header.append(icon, title);
  dialog.append(header, text, actions);
  return dialog;
}

function openDialog(kind, message, withCancel) {
  const dialog = buildDialog(kind, message, withCancel);
  document.body.append(dialog);
  dialog.showModal();
  return new Promise((resolve) => {
    dialog.addEventListener('close', () => {
      dialog.remove();
      resolve(dialog.returnValue === 'confirm');
    });
  });
}

export function showError(message) {
  return openDialog('error', message, false);
}

export function showInfo(message) {
  return openDialog('info', message, false);
}

export function confirmDiscard(message) {
  return openDialog('warning', message, true);
}
