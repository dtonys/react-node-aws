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
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Badge,
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  LinearProgress,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Divider,
  Stack,
  ButtonGroup,
  Fab,
  Rating,
  Slider,
  Autocomplete,
  Pagination,
  Link,
  InputAdornment,
  FormHelperText,
  FormGroup,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';

import {
  ExpandMore,
  Delete,
  Add,
  Edit,
  Favorite,
  Share,
  MoreVert,
  Home,
  Settings,
  Person,
  Notifications,
  Search,
  Mail,
  Menu,
  CloudUpload,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useState, useRef, useEffect, RefObject } from 'react';
import { useNotification } from 'client/components/NotificationContext';
import Nav from 'client/components/Nav';
import NavLoggedOut from 'client/components/NavLoggedOut';

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
];

type StyleguideProps = {
  currentUserRef: RefObject<Record<string, any> | null>;
  loadCookieSession: () => Promise<void>;
};

const Styleguide = ({ currentUserRef, loadCookieSession }: StyleguideProps) => {
  const currentUser = currentUserRef.current;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dateValue, setDateValue] = useState<Date | null>(new Date());
  const [timeValue, setTimeValue] = useState<Date | null>(new Date());
  const [dateTimeValue, setDateTimeValue] = useState<Date | null>(new Date());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toggleValue, setToggleValue] = useState<string>('one');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError, showInfo } = useNotification();

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
                      <Select label="Basic Select">
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
                      <Select label="Error Select">
                        <MenuItem value={1}>Option 1</MenuItem>
                        <MenuItem value={2}>Option 2</MenuItem>
                      </Select>
                      <FormHelperText>Selection is required</FormHelperText>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <FormControl fullWidth>
                      <InputLabel>Native Select</InputLabel>
                      <Select label="Native Select" native>
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
              <Stack spacing={3}>
                <Box>
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
                <Box>
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
                <Box>
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
                <Box>
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
                <Box>
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
                <Box>
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
              </Stack>
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
                    Linear Progress
                  </Typography>
                  <Stack spacing={2}>
                    <LinearProgress />
                    <LinearProgress variant="determinate" value={60} />
                    <LinearProgress color="secondary" />
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Circular Progress
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <CircularProgress size={24} />
                    <CircularProgress />
                    <CircularProgress size={60} />
                    <CircularProgress variant="determinate" value={75} />
                  </Box>
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
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Dialog
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
              </Stack>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Date Picker Section */}
            <Box id="DatePickerSection" sx={{ mt: 4, scrollMarginTop: '24px' }}>
              <Typography variant="h4" component="h4" gutterBottom>
                Date Time Pickers
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <DatePicker
                      label="Date Picker"
                      value={dateValue}
                      onChange={(newValue) => setDateValue(newValue)}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <TimePicker
                      label="Time Picker"
                      value={timeValue}
                      onChange={(newValue) => setTimeValue(newValue)}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <DateTimePicker
                      label="Date & Time Picker"
                      value={dateTimeValue}
                      onChange={(newValue) => setDateTimeValue(newValue)}
                    />
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <DatePicker
                      label="Disabled Date Picker"
                      value={dateValue}
                      onChange={(newValue) => setDateValue(newValue)}
                      disabled
                    />
                  </Box>
                </Box>
              </Box>
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
                    Drag & Drop Zone
                  </Typography>
                  <Paper
                    sx={{
                      p: 4,
                      border: '2px dashed',
                      borderColor: 'divider',
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                      },
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1">
                      Drag and drop files here, or click to select
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Supports: JPG, PNG, PDF (Max 10MB)
                    </Typography>
                  </Paper>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ height: 100 }} />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Styleguide;
