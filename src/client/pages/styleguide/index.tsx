import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Paper,
  Chip,
  Alert,
  Snackbar,
  LinearProgress,
  CircularProgress,
  IconButton,
  Drawer,
  Divider,
  Stack,
  ButtonGroup,
  Fab,
  Autocomplete,
  Link,
  InputAdornment,
  FormHelperText,
  FormGroup,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Menu,
} from '@mui/material';

import { Add, Delete, Edit, Search, CloudUpload, Close } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useState, useRef, useEffect, RefObject } from 'react';
import { useNotification } from 'client/components/NotificationContext';
import Nav from 'client/components/Nav';
import NavLoggedOut from 'client/components/NavLoggedOut';
import FileUpload from 'client/pages/styleguide/components/FileUpload';
import FormSection from 'client/pages/styleguide/sections/FormSection';
import fetchClient from 'client/helpers/fetchClient';

type TableOfContentsItem = {
  id: string;
  label: string;
};

const tableOfContents: TableOfContentsItem[] = [
  { id: 'TypographySection', label: 'Typography' },
  { id: 'TextInputSection', label: 'Text Inputs' },
  { id: 'SelectSection', label: 'Selects' },
  { id: 'RadioCheckboxSwitchSection', label: 'Checkboxes & Radios' },
  { id: 'ButtonSection', label: 'Buttons' },
  { id: 'LoadingSection', label: 'Loading' },
  { id: 'NotificationsSection', label: 'Notifications' },
  { id: 'ModalsSection', label: 'Modals' },
  { id: 'DatePickerSection', label: 'Date Time Pickers' },
  { id: 'FileUploadSection', label: 'File Upload' },
  { id: 'FormSubmissionSection', label: 'Form Submission' },
];

type StyleguideProps = {
  currentUserRef: RefObject<Record<string, any> | null>;
  loadCookieSession: () => Promise<void>;
};

const Styleguide = ({ currentUserRef, loadCookieSession }: StyleguideProps) => {
  const currentUser = currentUserRef.current;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [fullscreenLoading, setFullscreenLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [dateValue, setDateValue] = useState<Date | null>(new Date());
  const [timeValue, setTimeValue] = useState<Date | null>(new Date());
  const [dateTimeValue, setDateTimeValue] = useState<Date | null>(new Date());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toggleValue, setToggleValue] = useState<string>('one');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError, showInfo } = useNotification();

  // File Upload state
  const [previewImgUrl, setPreviewImgUrl] = useState<string | null>(null);
  const [apiImgUrl, setApiImgUrl] = useState<string | null>(null);
  const [errorImgUrl, setErrorImgUrl] = useState<string | null>(null);
  const [customSizeImgUrl, setCustomSizeImgUrl] = useState<string | null>(null);

  // Handle initial hash on page load
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <Box className="app">
      {currentUser ? (
        <Nav userEmail={currentUser.email} loadCookieSession={loadCookieSession} />
      ) : (
        <NavLoggedOut />
      )}
      <Box className="content">
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Typography variant="h3" component="h2" gutterBottom>
              Styleguide
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive showcase of Material-UI components and common use cases
            </Typography>

            {/* Table of Contents */}
            <Paper sx={{ p: 3, my: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Table of Contents
              </Typography>
              <List disablePadding>
                {tableOfContents.map((item) => (
                  <ListItem key={item.id} disablePadding>
                    <Link
                      href={`#${item.id}`}
                      underline="hover"
                      sx={{
                        py: 0.5,
                      }}
                    >
                      {item.label}
                    </Link>
                  </ListItem>
                ))}
              </List>
            </Paper>

            <Divider sx={{ my: 4 }} />

            {/* Typography Section */}
            <Box id="TypographySection" sx={{ mt: 4, scrollMarginTop: '24px' }}>
              <Typography variant="h4" component="h4" gutterBottom>
                Typography
              </Typography>
              <Stack spacing={2}>
                <Typography variant="h1">Heading 1</Typography>
                <Typography variant="h2">Heading 2</Typography>
                <Typography variant="h3">Heading 3</Typography>
                <Typography variant="h4">Heading 4</Typography>
                <Typography variant="h5">Heading 5</Typography>
                <Typography variant="h6">Heading 6</Typography>
                <Typography variant="subtitle1">Subtitle 1</Typography>
                <Typography variant="subtitle2">Subtitle 2</Typography>
                <Typography variant="body1">Body 1 - Regular paragraph text</Typography>
                <Typography variant="body2">Body 2 - Smaller paragraph text</Typography>
                <Typography variant="button">Button Text</Typography>
                <Typography variant="caption">Caption Text</Typography>
                <Typography variant="overline">Overline Text</Typography>
              </Stack>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Text Input Section */}
            <Box id="TextInputSection" sx={{ mt: 4, scrollMarginTop: '24px' }}>
              <Typography variant="h4" component="h4" gutterBottom>
                Text Inputs
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField fullWidth label="Standard" variant="standard" />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField fullWidth label="Outlined" variant="outlined" />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField fullWidth label="Filled" variant="filled" />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      label="With Helper Text"
                      helperText="Some important text"
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField fullWidth label="Error State" error helperText="Incorrect entry" />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField fullWidth label="Disabled" disabled value="Disabled value" />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField fullWidth label="Password" type="password" />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField fullWidth label="Number" type="number" />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      label="With Left Icon"
                      placeholder="Search..."
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Search />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField
                      fullWidth
                      label="With Right Icon"
                      placeholder="Edit..."
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <Edit />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TextField fullWidth label="Multiline" multiline rows={4} />
                  </Box>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Select Section */}
            <Box id="SelectSection" sx={{ mt: 4, scrollMarginTop: '24px' }}>
              <Typography variant="h4" component="h4" gutterBottom>
                Selects
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <FormControl fullWidth>
                      <InputLabel>Basic Select</InputLabel>
                      <Select label="Basic Select" defaultValue="">
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value={1}>Option 1</MenuItem>
                        <MenuItem value={2}>Option 2</MenuItem>
                        <MenuItem value={3}>Option 3</MenuItem>
                      </Select>
                      <FormHelperText>Please select an option</FormHelperText>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <FormControl fullWidth disabled>
                      <InputLabel>Disabled Select</InputLabel>
                      <Select label="Disabled Select" value={1}>
                        <MenuItem value={1}>Option 1</MenuItem>
                        <MenuItem value={2}>Option 2</MenuItem>
                      </Select>
                      <FormHelperText>This field is disabled</FormHelperText>
                    </FormControl>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <FormControl fullWidth error>
                      <InputLabel>Error Select</InputLabel>
                      <Select label="Error Select" defaultValue="">
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value={1}>Option 1</MenuItem>
                        <MenuItem value={2}>Option 2</MenuItem>
                      </Select>
                      <FormHelperText>Selection is required</FormHelperText>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <FormControl fullWidth>
                      <InputLabel>Native Select</InputLabel>
                      <Select label="Native Select" native defaultValue="">
                        <option value="" />
                        <option value={10}>Ten</option>
                        <option value={20}>Twenty</option>
                        <option value={30}>Thirty</option>
                      </Select>
                      <FormHelperText>Native HTML select element</FormHelperText>
                    </FormControl>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Autocomplete
                      options={['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5']}
                      renderInput={(params) => (
                        <TextField {...params} label="Autocomplete" helperText="Type to search" />
                      )}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Autocomplete
                      multiple
                      options={['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5']}
                      filterSelectedOptions
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Multiple Autocomplete"
                          helperText="Select multiple options"
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Radio, Checkbox, Switch Section */}
            <Box id="RadioCheckboxSwitchSection" sx={{ mt: 4, scrollMarginTop: '24px' }}>
              <Typography variant="h4" component="h4" gutterBottom>
                Checkboxes & Radios
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="h6" gutterBottom>
                    Radio Buttons (Horizontal)
                  </Typography>
                  <FormLabel>Select an option</FormLabel>
                  <RadioGroup row defaultValue="option1">
                    <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
                    <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
                    <FormControlLabel value="option3" control={<Radio />} label="Option 3" />
                    <FormControlLabel
                      value="option4"
                      disabled
                      control={<Radio />}
                      label="Disabled"
                    />
                  </RadioGroup>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="h6" gutterBottom>
                    Radio Buttons (Vertical)
                  </Typography>
                  <FormLabel>Select an option</FormLabel>
                  <RadioGroup defaultValue="option1">
                    <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
                    <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
                    <FormControlLabel value="option3" control={<Radio />} label="Option 3" />
                    <FormControlLabel
                      value="option4"
                      disabled
                      control={<Radio />}
                      label="Disabled"
                    />
                  </RadioGroup>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="h6" gutterBottom>
                    Checkboxes (Horizontal)
                  </Typography>
                  <FormLabel>Select options</FormLabel>
                  <FormGroup row>
                    <FormControlLabel control={<Checkbox defaultChecked />} label="One" />
                    <FormControlLabel control={<Checkbox />} label="Two" />
                    <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
                    <FormControlLabel
                      control={<Checkbox disabled checked />}
                      label="Disabled Checked"
                    />
                  </FormGroup>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="h6" gutterBottom>
                    Checkboxes (Vertical)
                  </Typography>
                  <FormLabel>Select options</FormLabel>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox defaultChecked />} label="One" />
                    <FormControlLabel control={<Checkbox />} label="Two" />
                    <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
                    <FormControlLabel
                      control={<Checkbox disabled checked />}
                      label="Disabled Checked"
                    />
                  </FormGroup>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="h6" gutterBottom>
                    Switches (Horizontal)
                  </Typography>
                  <FormLabel>Toggle settings</FormLabel>
                  <FormGroup row>
                    <FormControlLabel control={<Switch defaultChecked />} label="On" />
                    <FormControlLabel control={<Switch />} label="Off" />
                    <FormControlLabel control={<Switch />} label="Required" required />
                    <FormControlLabel control={<Switch disabled />} label="Disabled" />
                  </FormGroup>
                </Box>
                <Box sx={{ flex: '1 1 45%' }}>
                  <Typography variant="h6" gutterBottom>
                    Switches (Vertical)
                  </Typography>
                  <FormLabel>Toggle settings</FormLabel>
                  <FormGroup>
                    <FormControlLabel control={<Switch defaultChecked />} label="On" />
                    <FormControlLabel control={<Switch />} label="Off" />
                    <FormControlLabel control={<Switch />} label="Required" required />
                    <FormControlLabel control={<Switch disabled />} label="Disabled" />
                  </FormGroup>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Button Section */}
            <Box id="ButtonSection" sx={{ mt: 4, scrollMarginTop: '24px' }}>
              <Typography variant="h4" component="h4" gutterBottom>
                Buttons
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Small
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button variant="text" size="small">
                      Text
                    </Button>
                    <Button variant="contained" size="small">
                      Contained
                    </Button>
                    <Button variant="outlined" size="small">
                      Outlined
                    </Button>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Medium
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button variant="text" size="medium">
                      Text
                    </Button>
                    <Button variant="contained" size="medium">
                      Contained
                    </Button>
                    <Button variant="outlined" size="medium">
                      Outlined
                    </Button>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Large
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button variant="text" size="large">
                      Text
                    </Button>
                    <Button variant="contained" size="large">
                      Contained
                    </Button>
                    <Button variant="outlined" size="large">
                      Outlined
                    </Button>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Disabled
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button variant="text" disabled>
                      Text
                    </Button>
                    <Button variant="contained" disabled>
                      Contained
                    </Button>
                    <Button variant="outlined" disabled>
                      Outlined
                    </Button>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    With Icons
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button variant="contained" startIcon={<Add />}>
                      Add Item
                    </Button>
                    <Button variant="outlined" endIcon={<Delete />}>
                      Delete
                    </Button>
                    <Button variant="text" startIcon={<Edit />}>
                      Edit
                    </Button>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Chips (Filled)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip label="Default" />
                    <Chip label="Primary" color="primary" />
                    <Chip label="Secondary" color="secondary" />
                    <Chip label="Success" color="success" />
                    <Chip label="Error" color="error" />
                    <Chip label="Warning" color="warning" />
                    <Chip label="Info" color="info" />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Chips (Outlined)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Chip label="Default" variant="outlined" />
                    <Chip label="Primary" color="primary" variant="outlined" />
                    <Chip label="Secondary" color="secondary" variant="outlined" />
                    <Chip label="Success" color="success" variant="outlined" />
                    <Chip label="Error" color="error" variant="outlined" />
                    <Chip label="Warning" color="warning" variant="outlined" />
                    <Chip label="Info" color="info" variant="outlined" />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Toggle Button Group
                  </Typography>
                  <ToggleButtonGroup
                    color="primary"
                    exclusive
                    value={toggleValue}
                    onChange={(_event, newValue) => {
                      if (newValue !== null) {
                        setToggleValue(newValue);
                      }
                    }}
                  >
                    <ToggleButton value="one">One</ToggleButton>
                    <ToggleButton value="two">Two</ToggleButton>
                    <ToggleButton value="three">Three</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Button Group & FAB
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <ButtonGroup variant="contained">
                      <Button>One</Button>
                      <Button>Two</Button>
                      <Button>Three</Button>
                    </ButtonGroup>
                    <Fab color="primary" aria-label="add" size="small">
                      <Add />
                    </Fab>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Loading Buttons
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button loading variant="contained">
                      Submit 222
                    </Button>
                    <Button loading variant="outlined">
                      Submit
                    </Button>
                    <Button loading loadingIndicator="Loading…" variant="contained">
                      Fetch data
                    </Button>
                    <Button
                      loading
                      loadingPosition="start"
                      startIcon={<CloudUpload />}
                      variant="contained"
                    >
                      Upload
                    </Button>
                    <Button
                      loading
                      loadingPosition="end"
                      endIcon={<CloudUpload />}
                      variant="contained"
                    >
                      Upload
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Loading Section */}
            <Box id="LoadingSection" sx={{ mt: 4, scrollMarginTop: '24px' }}>
              <Typography variant="h4" component="h4" gutterBottom>
                Loading
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Skeleton
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <Skeleton animation="wave" variant="circular" width={100} height={100} />
                    <Skeleton animation="wave" variant="rectangular" width={100} height={100} />
                    <Skeleton
                      animation="wave"
                      variant="rounded"
                      width={100}
                      height={100}
                      sx={{ borderRadius: '10px' }}
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Skeleton animation="wave" variant="text" sx={{ fontSize: '2rem' }} />
                    <Skeleton animation="wave" variant="text" sx={{ fontSize: '2rem' }} />
                    <Skeleton animation="wave" variant="text" sx={{ fontSize: '2rem' }} />
                    <Skeleton
                      animation="wave"
                      variant="text"
                      sx={{ fontSize: '2rem', width: '60%' }}
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Circular Progress
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <CircularProgress color="primary" />
                    <CircularProgress color="secondary" />
                    <CircularProgress color="success" />
                    <CircularProgress color="error" />
                    <CircularProgress color="info" />
                    <CircularProgress color="warning" />
                  </Box>
                  <Box
                    sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mt: 2 }}
                  >
                    <CircularProgress size={24} />
                    <CircularProgress size={40} />
                    <CircularProgress size={60} />
                    <CircularProgress variant="determinate" value={25} />
                    <CircularProgress variant="determinate" value={50} />
                    <CircularProgress variant="determinate" value={75} />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Linear Progress
                  </Typography>
                  <Stack spacing={2}>
                    <LinearProgress color="primary" />
                    <LinearProgress color="secondary" />
                    <LinearProgress color="success" />
                    <LinearProgress color="error" />
                    <LinearProgress color="info" />
                    <LinearProgress color="warning" />
                    <LinearProgress variant="determinate" value={60} />
                  </Stack>
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Notifications Section */}
            <Box id="NotificationsSection" sx={{ mt: 4, scrollMarginTop: '24px' }}>
              <Typography variant="h4" component="h4" gutterBottom>
                Notifications
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Alerts
                  </Typography>
                  <Stack spacing={2}>
                    <Alert severity="error">This is an error alert</Alert>
                    <Alert severity="warning">This is a warning alert</Alert>
                    <Alert severity="info">This is an info alert</Alert>
                    <Alert severity="success">This is a success alert</Alert>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Snackbar Notifications
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => showSuccess('Success notification!')}
                    >
                      Show Success
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => showError('Error notification!')}
                    >
                      Show Error
                    </Button>
                    <Button
                      variant="contained"
                      color="info"
                      onClick={() => showInfo('Info notification!')}
                    >
                      Show Info
                    </Button>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Basic Snackbar
                  </Typography>
                  <Button variant="outlined" onClick={() => setSnackbarOpen(true)}>
                    Open Basic Snackbar
                  </Button>
                  <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                    message="This is a snackbar message"
                  />
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Modals Section */}
            <Box id="ModalsSection" sx={{ mt: 4, scrollMarginTop: '24px' }}>
              <Typography variant="h4" component="h4" gutterBottom>
                Modals
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="h6" gutterBottom>
                    Basic Dialog
                  </Typography>
                  <Button variant="contained" onClick={() => setDialogOpen(true)}>
                    Open Dialog
                  </Button>
                  <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                    <DialogTitle>Dialog Title</DialogTitle>
                    <DialogContent>
                      <Typography>
                        This is a dialog content area. You can put forms, text, or any content here.
                      </Typography>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button onClick={() => setDialogOpen(false)} variant="contained">
                        Confirm
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="h6" gutterBottom>
                    Fullscreen Loading
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setFullscreenLoading(true);
                      setTimeout(() => setFullscreenLoading(false), 2000);
                    }}
                  >
                    Show Loading (2s)
                  </Button>
                  <Dialog open={fullscreenLoading}>
                    <DialogContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress />
                        <Typography>Loading...</Typography>
                      </Box>
                    </DialogContent>
                  </Dialog>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="h6" gutterBottom>
                    Confirm Modal
                  </Typography>
                  <Button variant="contained" onClick={() => setConfirmModalOpen(true)}>
                    Delete Item
                  </Button>
                  <Dialog open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)}>
                    <DialogTitle sx={{ pr: 6 }}>
                      Delete Item
                      <IconButton
                        aria-label="close"
                        onClick={() => setConfirmModalOpen(false)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        <Close />
                      </IconButton>
                    </DialogTitle>
                    <DialogContent>
                      <Typography>
                        Are you sure you want to delete this item? This action cannot be undone.
                      </Typography>
                    </DialogContent>
                    <DialogActions>
                      <Button variant="outlined" onClick={() => setConfirmModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setConfirmModalOpen(false)}
                      >
                        Yes, Delete
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="h6" gutterBottom>
                    Drawer (Sidebar)
                  </Typography>
                  <Button variant="contained" onClick={() => setDrawerOpen(true)}>
                    Open Right Drawer
                  </Button>
                  <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                    <Box
                      sx={{ width: 400, height: '100%', display: 'flex', flexDirection: 'column' }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="h6">Drawer Header</Typography>
                        <IconButton onClick={() => setDrawerOpen(false)}>
                          <Close />
                        </IconButton>
                      </Box>
                      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                        {[...Array(40)].map((_, index) => (
                          <Typography key={index} sx={{ mb: 1 }}>
                            Drawer content line {index + 1}
                          </Typography>
                        ))}
                      </Box>
                      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)}>
                          Close Drawer
                        </Button>
                      </Box>
                    </Box>
                  </Drawer>
                </Box>
                <Box sx={{ flex: '1 1 300px' }}>
                  <Typography variant="h6" gutterBottom>
                    Menu
                  </Typography>
                  <Button variant="contained" ref={menuButtonRef} onClick={() => setMenuOpen(true)}>
                    Open Menu
                  </Button>
                  <Menu
                    anchorEl={menuButtonRef.current}
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                  >
                    <MenuItem onClick={() => setMenuOpen(false)}>Profile</MenuItem>
                    <MenuItem onClick={() => setMenuOpen(false)}>My Account</MenuItem>
                    <MenuItem onClick={() => setMenuOpen(false)}>Settings</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => setMenuOpen(false)}>Logout</MenuItem>
                  </Menu>
                </Box>
                <Box sx={{ flex: '1 1 300px' }} />
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Date Picker Section */}
            <Box id="DatePickerSection" sx={{ mt: 4, scrollMarginTop: '24px' }}>
              <Typography variant="h4" component="h4" gutterBottom>
                Date Time Pickers
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Basic Pickers
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <DatePicker
                        label="Date Picker"
                        value={dateValue}
                        onChange={(newValue) => setDateValue(newValue)}
                        slotProps={{
                          textField: {
                            helperText: 'Select a date',
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <TimePicker
                        label="Time Picker"
                        value={timeValue}
                        onChange={(newValue) => setTimeValue(newValue)}
                        slotProps={{
                          textField: {
                            helperText: 'Select a time',
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <DateTimePicker
                        label="Date & Time Picker"
                        value={dateTimeValue}
                        onChange={(newValue) => setDateTimeValue(newValue)}
                        slotProps={{
                          textField: {
                            helperText: 'Select date and time',
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Disabled State
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <DatePicker
                        label="Disabled Date"
                        value={dateValue}
                        onChange={(newValue) => setDateValue(newValue)}
                        disabled
                        slotProps={{
                          textField: {
                            helperText: 'This field is disabled',
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <TimePicker
                        label="Disabled Time"
                        value={timeValue}
                        onChange={(newValue) => setTimeValue(newValue)}
                        disabled
                        slotProps={{
                          textField: {
                            helperText: 'This field is disabled',
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px' }} />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Error State
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <DatePicker
                        label="Start Date"
                        value={dateValue}
                        onChange={(newValue) => setDateValue(newValue)}
                        slotProps={{
                          textField: {
                            error: true,
                            helperText: 'Start date is required',
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <DatePicker
                        label="End Date"
                        value={dateValue}
                        onChange={(newValue) => setDateValue(newValue)}
                        slotProps={{
                          textField: {
                            error: true,
                            helperText: 'End date must be after start date',
                          },
                        }}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <DateTimePicker
                        label="Event Time"
                        value={dateTimeValue}
                        onChange={(newValue) => setDateTimeValue(newValue)}
                        slotProps={{
                          textField: {
                            error: true,
                            helperText: 'Invalid date/time format',
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* File Upload Section */}
            <Box id="FileUploadSection" sx={{ mt: 4, scrollMarginTop: '24px' }}>
              <Typography variant="h4" component="h4" gutterBottom>
                File Upload
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Button Upload
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload File
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {selectedFile && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected: {selectedFile.name}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    File Upload Component
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <FileUpload
                      inputLabelText="Upload in Memory"
                      value={previewImgUrl}
                      onChangeFile={(file) => {
                        setPreviewImgUrl(URL.createObjectURL(file));
                      }}
                      onDeleteButtonClick={() => setPreviewImgUrl(null)}
                      helperText="Preview only, not saved"
                    />
                    <FileUpload
                      inputLabelText="Upload to API"
                      value={apiImgUrl}
                      onChangeFile={async (file) => {
                        const formData = new FormData();
                        formData.append('file', file);
                        const response = (await fetchClient.post(
                          '/api/uploads/users',
                          formData,
                        )) as { url: string };
                        setApiImgUrl(response.url);
                        showSuccess('Image uploaded successfully');
                      }}
                      onDeleteButtonClick={() => setApiImgUrl(null)}
                      helperText="Uploads to /api/uploads/users"
                    />
                    <FileUpload
                      inputLabelText="With Error"
                      value={errorImgUrl}
                      onChangeFile={(file) => {
                        setErrorImgUrl(URL.createObjectURL(file));
                      }}
                      onDeleteButtonClick={() => setErrorImgUrl(null)}
                      error
                      helperText="Image is required"
                      required
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Custom Size
                  </Typography>
                  <FileUpload
                    inputLabelText="Large Upload Zone"
                    value={customSizeImgUrl}
                    onChangeFile={(file) => {
                      setCustomSizeImgUrl(URL.createObjectURL(file));
                    }}
                    onDeleteButtonClick={() => setCustomSizeImgUrl(null)}
                    containerSx={{ width: '100%', height: '200px' }}
                    helperText="Full width upload zone"
                  />
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Form Submission Section */}
            <FormSection />

            <Box sx={{ height: 100 }} />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Styleguide;
