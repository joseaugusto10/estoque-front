import Swal from 'sweetalert2'

export const confirmarAcao = async (mensagem: string) => {
  const result = await Swal.fire({
    title: 'Confirmação',
    text: mensagem,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sim',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
  })

  return result.isConfirmed
}

export const toastSucesso = (mensagem: string) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: mensagem,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  })
}

export const toastErro = (mensagem: string) => {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'error',
    title: mensagem,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  })
}
