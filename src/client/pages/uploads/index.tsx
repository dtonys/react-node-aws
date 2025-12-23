import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect, useRef } from 'react';
import Nav from 'client/components/Nav';
import fetchClient from 'client/helpers/fetchClient';

type UploadFile = {
  key: string;
  url: string;
  size: number;
  lastModified: string;
};

type UploadsProps = {
  currentUser: Record<string, any> | null;
  loadCookieSession: () => Promise<void>;
};

const Uploads = ({ currentUser, loadCookieSession }: UploadsProps) => {
  const userEmail = currentUser?.email || '';
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchUploads = async () => {
    const data = await fetchClient.get<{ files: UploadFile[] }>('/api/uploads');
    setFiles(data.files || []);
    setIsLoadingFiles(false);
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async (file: UploadFile) => {
    const imageKey = file.key?.split('/').pop();
    if (!imageKey) return;

    await fetchClient.delete(`/api/uploads/users/${imageKey}`);
    await fetchUploads();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    await fetchClient.post('/api/uploads/users', formData);
    await fetchUploads();
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <Nav userEmail={userEmail} loadCookieSession={loadCookieSession} />
      <Container maxWidth="md">
        <Box sx={{ py: 3 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}
          >
            <Typography variant="h4" component="h1">
              Uploads
            </Typography>
            <Button
              variant="contained"
              startIcon={
                isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />
              }
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </Box>

          {isLoadingFiles ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : files.length === 0 ? (
            <Typography color="text.secondary">No uploads yet.</Typography>
          ) : (
            <Grid container spacing={2}>
              {files.map((file) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.key}>
                  <Card
                    sx={{
                      position: 'relative',
                      '&:hover .delete-button': {
                        opacity: 1,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={file.url}
                      alt={file.key}
                      sx={{ height: 200, objectFit: 'contain', backgroundColor: '#f5f5f5' }}
                    />
                    <IconButton
                      className="delete-button"
                      onClick={() => handleDelete(file)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          color: 'error.main',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Uploads;
