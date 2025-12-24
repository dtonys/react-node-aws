import {
  Box,
  Button,
  CircularProgress,
  FormHelperText,
  InputLabel,
  IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useState, useRef, CSSProperties } from 'react';

type ContainerSxProps = {
  uploading?: boolean;
  [key: string]: unknown;
};

const getContainerSx = ({ uploading, ...sxProps }: ContainerSxProps) => ({
  width: '200px',
  height: '130px',
  borderRadius: '8px',
  border: '1px solid #C8C8C8',
  background: '#FFF',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: uploading ? 'default' : 'pointer',
  position: 'relative' as const,
  '&:hover': {
    backgroundColor: uploading ? '#FFF' : '#F5F5F5',
  },
  ...sxProps,
});

const imgFrameSx = {
  width: 'calc(100% - 15px)',
  height: 'calc(100% - 15px)',
};

const imgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
};

const uploadBtnSx = {
  '&:hover, &:focus': {
    backgroundColor: 'inherit',
    boxShadow: 'none',
  },
};

const deleteBtnSx = {
  position: 'absolute',
  top: '5px',
  right: '5px',
  background: '#D32F2F',
  borderRadius: '50%',
  color: 'white',
  width: '24px',
  height: '24px',
  padding: '4px',
  '&:hover': {
    background: '#B71C1C',
  },
};

type FileUploadProps = {
  value?: string | null;
  onChangeFile?: (file: File) => void | Promise<void>;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  inputLabelText?: string;
  uploadButtonText?: string;
  onDeleteButtonClick?: () => void;
  containerSx?: Record<string, unknown>;
  accept?: string;
};

function FileUpload({
  value = null,
  onChangeFile = () => {},
  required = false,
  error = false,
  helperText = ' ',
  inputLabelText = '',
  uploadButtonText = 'Upload',
  onDeleteButtonClick = () => {},
  containerSx = {},
  accept = 'image/*',
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleDeleteClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteButtonClick();
  };

  const handleContainerClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      await onChangeFile(file);
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Box>
      {inputLabelText && (
        <InputLabel required={required} error={error} sx={{ mb: 1 }}>
          {inputLabelText}
        </InputLabel>
      )}
      <Box sx={getContainerSx({ uploading, ...containerSx })} onClick={handleContainerClick}>
        {uploading && <CircularProgress color="primary" size={32} />}
        {Boolean(value) && !uploading && (
          <>
            <Box sx={imgFrameSx}>
              <img src={value as string} style={imgStyle} alt="Preview" />
            </Box>
            <IconButton sx={deleteBtnSx} onClick={handleDeleteClick} size="small">
              <Delete sx={{ fontSize: 16 }} />
            </IconButton>
          </>
        )}
        {!value && !uploading && (
          <Button variant="outlined" size="medium" sx={uploadBtnSx}>
            {uploadButtonText}
          </Button>
        )}
        <input type="file" accept={accept} hidden ref={fileInputRef} onChange={handleFileChange} />
      </Box>
      <FormHelperText error={error}>{helperText}</FormHelperText>
    </Box>
  );
}

export default FileUpload;
