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
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';

const Styleguide = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [ratingValue, setRatingValue] = useState<number | null>(4);
  const [sliderValue, setSliderValue] = useState(30);
  const [dateValue, setDateValue] = useState<Date | null>(new Date());
  const [timeValue, setTimeValue] = useState<Date | null>(new Date());
  const [dateTimeValue, setDateTimeValue] = useState<Date | null>(new Date());

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h1" component="h1" gutterBottom>
          MUI Component Styleguide
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary">
          Comprehensive showcase of Material-UI components and common use cases
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
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

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Buttons
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained">Contained</Button>
              <Button variant="outlined">Outlined</Button>
              <Button variant="text">Text</Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" color="primary">
                Primary
              </Button>
              <Button variant="contained" color="secondary">
                Secondary
              </Button>
              <Button variant="contained" color="error">
                Error
              </Button>
              <Button variant="contained" color="warning">
                Warning
              </Button>
              <Button variant="contained" color="info">
                Info
              </Button>
              <Button variant="contained" color="success">
                Success
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" size="small">
                Small
              </Button>
              <Button variant="contained" size="medium">
                Medium
              </Button>
              <Button variant="contained" size="large">
                Large
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" startIcon={<Add />}>
                Add Item
              </Button>
              <Button variant="outlined" endIcon={<Delete />}>
                Delete
              </Button>
              <Button variant="contained" disabled>
                Disabled
              </Button>
            </Box>
            <ButtonGroup variant="contained">
              <Button>One</Button>
              <Button>Two</Button>
              <Button>Three</Button>
            </ButtonGroup>
            <Fab color="primary" aria-label="add">
              <Add />
            </Fab>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Form Controls
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
                <TextField fullWidth label="With Helper Text" helperText="Some important text" />
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
                <FormControl fullWidth>
                  <InputLabel>Select</InputLabel>
                  <Select label="Select">
                    <MenuItem value={1}>Option 1</MenuItem>
                    <MenuItem value={2}>Option 2</MenuItem>
                    <MenuItem value={3}>Option 3</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 300px' }}>
                <Autocomplete
                  options={['Option 1', 'Option 2', 'Option 3']}
                  renderInput={(params) => <TextField {...params} label="Autocomplete" />}
                />
              </Box>
            </Box>
            <Box>
              <FormControlLabel control={<Checkbox defaultChecked />} label="Checkbox" />
              <FormControlLabel control={<Checkbox />} label="Unchecked" />
              <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
            </Box>
            <Box>
              <FormControl>
                <FormLabel>Radio Group</FormLabel>
                <RadioGroup defaultValue="option1">
                  <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
                  <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
                  <FormControlLabel value="option3" control={<Radio />} label="Option 3" />
                </RadioGroup>
              </FormControl>
            </Box>
            <Box>
              <FormControlLabel control={<Switch defaultChecked />} label="Switch On" />
              <FormControlLabel control={<Switch />} label="Switch Off" />
            </Box>
            <Box>
              <Typography gutterBottom>Slider: {sliderValue}</Typography>
              <Slider value={sliderValue} onChange={(_, val) => setSliderValue(val as number)} />
            </Box>
            <Box>
              <Typography component="legend">Rating</Typography>
              <Rating value={ratingValue} onChange={(_, val) => setRatingValue(val)} />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <DatePicker label="Date Picker" value={dateValue} onChange={(newValue) => setDateValue(newValue)} />
              </Box>
              <Box sx={{ flex: '1 1 300px' }}>
                <TimePicker label="Time Picker" value={timeValue} onChange={(newValue) => setTimeValue(newValue)} />
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

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Cards
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 300px' }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Simple Card
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Card content goes here
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 300px' }}>
              <Card>
                <CardHeader title="Card with Header" subheader="September 14, 2024" />
                <CardContent>
                  <Typography variant="body2">Card with header and actions</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Share</Button>
                  <Button size="small">Learn More</Button>
                </CardActions>
              </Card>
            </Box>
            <Box sx={{ flex: '1 1 300px' }}>
              <Card>
                <CardHeader
                  avatar={<Avatar>R</Avatar>}
                  action={
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  }
                  title="Card with Avatar"
                  subheader="With actions"
                />
                <CardContent>
                  <Typography variant="body2">Card with avatar and action menu</Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Lists
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 400px' }}>
              <Paper>
                <List>
                  <ListItem>
                    <ListItemText primary="Single-line item" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Item with secondary text" secondary="Secondary text" />
                  </ListItem>
                  <ListItemButton>
                    <ListItemIcon>
                      <Home />
                    </ListItemIcon>
                    <ListItemText primary="Clickable item with icon" />
                  </ListItemButton>
                  <ListItemButton>
                    <ListItemIcon>
                      <Settings />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                  </ListItemButton>
                </List>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 400px' }}>
              <Paper>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText primary="Person" secondary="With icon" />
                    <IconButton edge="end">
                      <Edit />
                    </IconButton>
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <Notifications />
                    </ListItemIcon>
                    <ListItemText primary="Notifications" secondary="With action" />
                    <IconButton edge="end">
                      <Delete />
                    </IconButton>
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Tables
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Calories</TableCell>
                  <TableCell align="right">Fat (g)</TableCell>
                  <TableCell align="right">Carbs (g)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Frozen yoghurt</TableCell>
                  <TableCell align="right">159</TableCell>
                  <TableCell align="right">6.0</TableCell>
                  <TableCell align="right">24</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ice cream sandwich</TableCell>
                  <TableCell align="right">237</TableCell>
                  <TableCell align="right">9.0</TableCell>
                  <TableCell align="right">37</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Eclair</TableCell>
                  <TableCell align="right">262</TableCell>
                  <TableCell align="right">16.0</TableCell>
                  <TableCell align="right">24</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Data Grid
          </Typography>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={[
                { id: 1, name: 'John Doe', email: 'john@example.com', age: 35, status: 'Active' },
                { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 28, status: 'Active' },
                { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 42, status: 'Inactive' },
                { id: 4, name: 'Alice Williams', email: 'alice@example.com', age: 31, status: 'Active' },
                { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', age: 26, status: 'Pending' },
              ]}
              columns={[
                { field: 'id', headerName: 'ID', width: 90 },
                { field: 'name', headerName: 'Name', width: 200 },
                { field: 'email', headerName: 'Email', width: 250 },
                { field: 'age', headerName: 'Age', type: 'number', width: 100 },
                { field: 'status', headerName: 'Status', width: 130 },
              ]}
              pageSizeOptions={[5, 10]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 5 },
                },
              }}
              checkboxSelection
              disableRowSelectionOnClick
            />
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Tabs
          </Typography>
          <Paper>
            <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
              <Tab label="Item One" />
              <Tab label="Item Two" />
              <Tab label="Item Three" />
            </Tabs>
            <Box sx={{ p: 3 }}>
              {tabValue === 0 && <Typography>Content for Tab One</Typography>}
              {tabValue === 1 && <Typography>Content for Tab Two</Typography>}
              {tabValue === 2 && <Typography>Content for Tab Three</Typography>}
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Accordion
          </Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Accordion 1</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Content for accordion 1</Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Accordion 2</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>Content for accordion 2</Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Chips & Badges
          </Typography>
          <Stack spacing={2} direction="row" flexWrap="wrap">
            <Chip label="Basic" />
            <Chip label="Clickable" onClick={() => {}} />
            <Chip label="Deletable" onDelete={() => {}} />
            <Chip label="Colored" color="primary" />
            <Chip label="Outlined" variant="outlined" />
            <Badge badgeContent={4} color="primary">
              <Notifications />
            </Badge>
            <Badge badgeContent={100} color="error" max={99}>
              <Mail />
            </Badge>
            <Badge variant="dot" color="success">
              <Person />
            </Badge>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Avatars
          </Typography>
          <Stack direction="row" spacing={2}>
            <Avatar>H</Avatar>
            <Avatar src="/broken-image.jpg" alt="Broken" />
            <Avatar sx={{ bgcolor: 'primary.main' }}>N</Avatar>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>OP</Avatar>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Tooltips
          </Typography>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Add">
              <IconButton>
                <Add />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton>
                <Delete />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton>
                <Edit />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Alerts & Snackbars
          </Typography>
          <Stack spacing={2}>
            <Alert severity="error">This is an error alert</Alert>
            <Alert severity="warning">This is a warning alert</Alert>
            <Alert severity="info">This is an info alert</Alert>
            <Alert severity="success">This is a success alert</Alert>
            <Button variant="outlined" onClick={() => setSnackbarOpen(true)}>
              Open Snackbar
            </Button>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
              message="This is a snackbar message"
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Progress Indicators
          </Typography>
          <Stack spacing={2}>
            <LinearProgress />
            <LinearProgress variant="determinate" value={60} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <CircularProgress />
              <CircularProgress variant="determinate" value={75} />
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Dialogs
          </Typography>
          <Button variant="contained" onClick={() => setDialogOpen(true)}>
            Open Dialog
          </Button>
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>Dialog Title</DialogTitle>
            <DialogContent>
              <Typography>This is a dialog content area</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => setDialogOpen(false)} variant="contained">
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Navigation
          </Typography>
          <AppBar position="static">
            <Toolbar>
              <IconButton edge="start" color="inherit">
                <Menu />
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                App Bar
              </Typography>
              <IconButton color="inherit">
                <Search />
              </IconButton>
              <IconButton color="inherit">
                <Notifications />
              </IconButton>
            </Toolbar>
          </AppBar>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Pagination
          </Typography>
          <Pagination count={10} color="primary" />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ mt: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            Layout - Grid System
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>xs=12 md=4</Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>xs=12 md=4</Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2 }}>xs=12 md=4</Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default Styleguide;
