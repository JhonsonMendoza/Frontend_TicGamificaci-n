import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Ingresa un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
});

export const registerSchema = yup.object().shape({
  university: yup
    .string()
    .max(100, 'El nombre de la universidad no puede exceder 100 caracteres')
    .optional(),
  career: yup
    .string()
    .max(100, 'El nombre de la carrera no puede exceder 100 caracteres')
    .optional(),
  name: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .required('El nombre es requerido'),
  email: yup
    .string()
    .email('Ingresa un email válido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
    .required('La contraseña es requerida'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

export const profileUpdateSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .required('El nombre es requerido'),
  university: yup
    .string()
    .max(100, 'El nombre de la universidad no puede exceder 100 caracteres')
    .optional(),
  career: yup
    .string()
    .max(100, 'El nombre de la carrera no puede exceder 100 caracteres')
    .optional(),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
export type RegisterFormData = yup.InferType<typeof registerSchema>;
export type ProfileUpdateFormData = yup.InferType<typeof profileUpdateSchema>;