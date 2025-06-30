import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  TextField,
  Alert,
  Divider,
} from '@mui/material';
import { useApp } from '../../context/AppContext';
import { storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function Profile() {
  const { user } = useApp();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      // Actualizar el perfil del usuario con la nueva foto
      await updateProfile(photoURL);
      
      setSuccess('Foto de perfil actualizada exitosamente');
    } catch (error) {
      console.error('Error al subir la foto:', error);
      setError('Error al actualizar la foto de perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Actualizar el perfil del usuario
      await updateProfile();
      setSuccess('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      setError('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (photoURL = null) => {
    try {
      const userData = {
        ...formData,
        ...(photoURL && { photoURL }),
      };

      // Actualizar en Firebase Auth
      // await updateProfile(auth.currentUser, userData);

      // Actualizar en la base de datos
      // await api.put(`/users/${user.uid}`, userData);

      // Actualizar el estado local
      // TODO: Implementar actualización del contexto
    } catch (error) {
      throw error;
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Mi Perfil
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Avatar
                  src={user?.photoURL}
                  alt={user?.displayName}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                  }}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  type="file"
                  onChange={handlePhotoUpload}
                />
                <label htmlFor="photo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    disabled={loading}
                  >
                    Cambiar Foto
                  </Button>
                </label>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información Personal
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nombre"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  Guardar Cambios
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Profile; 