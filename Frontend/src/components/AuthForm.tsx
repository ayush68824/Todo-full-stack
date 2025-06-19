import React from 'react'
import { Box, Button, TextField, Typography, Stack, Avatar } from '@mui/material'
import { getFullImageUrl } from '../utils/api'

interface AuthFormProps {
  title: string
  fields: { name: string; label: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }[]
  onSubmit: (e: React.FormEvent) => void
  error?: string
  submitLabel: string
  showPhotoUpload?: boolean
  photoUrl?: string | null
  onPhotoChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  fields,
  onSubmit,
  error,
  submitLabel,
  showPhotoUpload,
  photoUrl,
  onPhotoChange,
}) => (
  <Box maxWidth={400} mx="auto" p={4} boxShadow={3} borderRadius={2} bgcolor="#fff">
    <Typography variant="h5" mb={2} align="center">{title}</Typography>
    <form onSubmit={onSubmit}>
      <Stack spacing={2}>
        {fields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            name={field.name}
            type={field.type || 'text'}
            value={field.value}
            onChange={field.onChange}
            fullWidth
            required
          />
        ))}
        {showPhotoUpload && (
          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="outlined" component="label">
              {photoUrl ? 'Change Photo' : 'Upload Photo'}
              <input type="file" accept="image/*" hidden onChange={onPhotoChange} />
            </Button>
            {photoUrl && <Avatar src={getFullImageUrl(photoUrl)} alt="User Photo" />}
          </Box>
        )}
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" variant="contained" color="primary" fullWidth>{submitLabel}</Button>
      </Stack>
    </form>
  </Box>
)

export default AuthForm 