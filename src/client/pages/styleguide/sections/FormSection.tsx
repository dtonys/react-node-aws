import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Select,
  MenuItem,
  InputLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Autocomplete,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import FileUpload from 'client/pages/styleguide/components/FileUpload';
import fetchClient from 'client/helpers/fetchClient';

// Autocomplete options for form
const formAutocompleteOptions = [
  { label: 'Iron Man', value: 'iron-man' },
  { label: 'Captain America', value: 'captain-america' },
  { label: 'Thor', value: 'thor' },
  { label: 'Hulk', value: 'hulk' },
  { label: 'Black Widow', value: 'black-widow' },
  { label: 'Hawkeye', value: 'hawkeye' },
  { label: 'Spider-Man', value: 'spider-man' },
  { label: 'Black Panther', value: 'black-panther' },
  { label: 'Doctor Strange', value: 'doctor-strange' },
  { label: 'Scarlet Witch', value: 'scarlet-witch' },
];

type FormMeta = {
  hasBeenBlurred: boolean;
  errorMessage: string | null;
  required: boolean;
};

function ValidationFailedModal({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open={true} onClose={onClose} transitionDuration={0}>
      <DialogContent sx={{ padding: '36px 36px 20px 36px', width: '500px' }}>
        <DialogTitle variant="h5" sx={{ padding: 0 }}>
          Validation failed
          <IconButton
            sx={{ position: 'absolute', top: 20, right: 36, padding: 0 }}
            onClick={onClose}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <Box sx={{ marginBottom: '24px' }} />
        <Typography variant="body1">
          An error was encountered with the form. Please correct fields highlighted in red.
        </Typography>
        <Box sx={{ marginBottom: '32px' }} />
        <DialogActions sx={{ padding: 0 }}>
          <Button variant="contained" onClick={onClose}>
            Ok
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}

function FormSection() {
  const [validationFailedModalOpen, setValidationFailedModalOpen] = useState(false);
  const [formSubmitAttempted, setFormSubmitAttempted] = useState(false);

  // Form values state
  const [formValues, setFormValues] = useState<Record<string, unknown>>({
    textField: '',
    nativeSelect: '',
    basicSelect: '',
    autocompleteSingle: null,
    autocompleteMultiple: [],
    radioField: 'option1',
    checkboxA: false,
    checkboxB: false,
    checkboxC: false,
    dateField: null as Date | null,
    fileUpload: null,
  });

  // Form meta state - tracks hasBeenBlurred, errorMessage, and required for each field
  const [formMeta, setFormMeta] = useState<Record<string, FormMeta>>({
    textField: { hasBeenBlurred: false, errorMessage: null, required: true },
    nativeSelect: { hasBeenBlurred: false, errorMessage: null, required: true },
    basicSelect: { hasBeenBlurred: false, errorMessage: null, required: true },
    autocompleteSingle: { hasBeenBlurred: false, errorMessage: null, required: true },
    autocompleteMultiple: { hasBeenBlurred: false, errorMessage: null, required: true },
    radioField: { hasBeenBlurred: false, errorMessage: null, required: true },
    checkboxA: { hasBeenBlurred: false, errorMessage: null, required: false },
    checkboxB: { hasBeenBlurred: false, errorMessage: null, required: false },
    checkboxC: { hasBeenBlurred: false, errorMessage: null, required: false },
    dateField: { hasBeenBlurred: false, errorMessage: null, required: true },
    fileUpload: { hasBeenBlurred: false, errorMessage: null, required: true },
  });

  // Determine if error should be shown - only after blur or submit attempt
  const shouldShowError = (name: string): boolean => {
    const meta = formMeta[name];
    return Boolean((formSubmitAttempted || meta.hasBeenBlurred) && meta.errorMessage);
  };

  // Get error message if should show
  const getErrorMessage = (name: string): string | null => {
    return shouldShowError(name) ? formMeta[name].errorMessage : null;
  };

  // Validate a single field
  const validateField = (name: string, value: unknown): string | null => {
    const meta = formMeta[name];
    if (meta.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${name} is required`;
    }
    return null;
  };

  // Validate on blur - sets hasBeenBlurred to true and validates
  const validateOnBlur = (name: string) => () => {
    const value = formValues[name];
    const errorMessage = validateField(name, value);
    setFormMeta((state) => ({
      ...state,
      [name]: {
        ...state[name],
        hasBeenBlurred: true,
        errorMessage,
      },
    }));
  };

  // Validate after form values have been updated (useful for async operations like file upload)
  const validateOnUpdatedFormValues = (
    name: string,
    updatedFormValues: Record<string, unknown>,
  ) => {
    const value = updatedFormValues[name];
    const errorMessage = validateField(name, value);
    setFormMeta((state) => ({
      ...state,
      [name]: {
        ...state[name],
        hasBeenBlurred: true,
        errorMessage,
      },
    }));
  };

  // Validate all required fields on submit
  const validateOnSubmit = (): string[] => {
    const errors: string[] = [];
    for (const name in formMeta) {
      const value = formValues[name];
      const meta = formMeta[name];
      if (meta.required && (!value || (Array.isArray(value) && value.length === 0))) {
        const error = `${name} is required`;
        errors.push(error);
        setFormMeta((state) => ({
          ...state,
          [name]: {
            ...state[name],
            errorMessage: error,
          },
        }));
      }
    }
    if (errors.length) {
      setValidationFailedModalOpen(true);
    }
    return errors;
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((state) => ({ ...state, [name]: value }));
  };

  // Handle form submit
  const handleFormSubmit = () => {
    const errors = validateOnSubmit();
    setFormSubmitAttempted(true);
    if (!errors.length) {
      console.log('Validation passed');
      console.log('Form values:', JSON.stringify(formValues, null, 2));
    }
  };

  // Handle form reset
  const handleFormReset = () => {
    setFormValues({
      textField: '',
      nativeSelect: '',
      basicSelect: '',
      autocompleteSingle: null,
      autocompleteMultiple: [],
      radioField: 'option1',
      checkboxA: false,
      checkboxB: false,
      checkboxC: false,
      dateField: null,
      fileUpload: null,
    });
    setFormMeta({
      textField: { hasBeenBlurred: false, errorMessage: null, required: true },
      nativeSelect: { hasBeenBlurred: false, errorMessage: null, required: true },
      basicSelect: { hasBeenBlurred: false, errorMessage: null, required: true },
      autocompleteSingle: { hasBeenBlurred: false, errorMessage: null, required: true },
      autocompleteMultiple: { hasBeenBlurred: false, errorMessage: null, required: true },
      radioField: { hasBeenBlurred: false, errorMessage: null, required: true },
      checkboxA: { hasBeenBlurred: false, errorMessage: null, required: false },
      checkboxB: { hasBeenBlurred: false, errorMessage: null, required: false },
      checkboxC: { hasBeenBlurred: false, errorMessage: null, required: false },
      dateField: { hasBeenBlurred: false, errorMessage: null, required: true },
      fileUpload: { hasBeenBlurred: false, errorMessage: null, required: true },
    });
    setFormSubmitAttempted(false);
    setValidationFailedModalOpen(false);
  };

  return (
    <Box id="FormSubmissionSection" sx={{ mt: 4, scrollMarginTop: '24px' }}>
      <Typography variant="h4" component="h4" gutterBottom>
        Form Submission
      </Typography>

      {validationFailedModalOpen && (
        <ValidationFailedModal onClose={() => setValidationFailedModalOpen(false)} />
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Controlled Form
            </Typography>
            <Stack spacing={3}>
              {/* Text Field */}
              <TextField
                label="textField"
                name="textField"
                value={formValues.textField}
                onChange={handleInputChange}
                onBlur={validateOnBlur('textField')}
                error={shouldShowError('textField')}
                helperText={getErrorMessage('textField') || 'Enter some text'}
                required={formMeta.textField.required}
                fullWidth
              />

              {/* Native Select */}
              <FormControl
                fullWidth
                error={shouldShowError('nativeSelect')}
                required={formMeta.nativeSelect.required}
              >
                <InputLabel>nativeSelect</InputLabel>
                <Select
                  native
                  label="nativeSelect"
                  name="nativeSelect"
                  value={formValues.nativeSelect}
                  onChange={(e) =>
                    setFormValues((state) => ({ ...state, nativeSelect: e.target.value }))
                  }
                  onBlur={validateOnBlur('nativeSelect')}
                >
                  <option value=""></option>
                  <option value={10}>Ten</option>
                  <option value={20}>Twenty</option>
                  <option value={30}>Thirty</option>
                </Select>
                <FormHelperText>{getErrorMessage('nativeSelect') || ' '}</FormHelperText>
              </FormControl>

              {/* Basic Select */}
              <FormControl
                fullWidth
                error={shouldShowError('basicSelect')}
                required={formMeta.basicSelect.required}
              >
                <InputLabel>basicSelect</InputLabel>
                <Select
                  label="basicSelect"
                  name="basicSelect"
                  value={formValues.basicSelect}
                  onChange={(e) =>
                    setFormValues((state) => ({ ...state, basicSelect: e.target.value }))
                  }
                  onBlur={validateOnBlur('basicSelect')}
                >
                  <MenuItem value="">Select a number</MenuItem>
                  <MenuItem value="one">One</MenuItem>
                  <MenuItem value="two">Two</MenuItem>
                  <MenuItem value="three">Three</MenuItem>
                </Select>
                <FormHelperText>{getErrorMessage('basicSelect') || ' '}</FormHelperText>
              </FormControl>

              {/* Autocomplete Single */}
              <Autocomplete
                options={formAutocompleteOptions}
                getOptionLabel={(option) => option.label}
                value={formValues.autocompleteSingle as { label: string; value: string } | null}
                onChange={(_e, value) =>
                  setFormValues((state) => ({ ...state, autocompleteSingle: value }))
                }
                onBlur={validateOnBlur('autocompleteSingle')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="autocompleteSingle"
                    error={shouldShowError('autocompleteSingle')}
                    helperText={getErrorMessage('autocompleteSingle') || ' '}
                    required={formMeta.autocompleteSingle.required}
                    placeholder="Select a value..."
                  />
                )}
              />

              {/* Autocomplete Multiple */}
              <Autocomplete
                multiple
                options={formAutocompleteOptions}
                getOptionLabel={(option) => option.label}
                value={formValues.autocompleteMultiple as { label: string; value: string }[]}
                onChange={(_e, value) =>
                  setFormValues((state) => ({ ...state, autocompleteMultiple: value }))
                }
                onBlur={validateOnBlur('autocompleteMultiple')}
                filterSelectedOptions
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="autocompleteMultiple"
                    error={shouldShowError('autocompleteMultiple')}
                    helperText={getErrorMessage('autocompleteMultiple') || ' '}
                    required={formMeta.autocompleteMultiple.required}
                    placeholder="Select values..."
                  />
                )}
              />

              {/* Radio Group */}
              <FormControl>
                <FormLabel>radioField</FormLabel>
                <RadioGroup
                  row
                  name="radioField"
                  value={formValues.radioField || 'option1'}
                  onChange={(e) =>
                    setFormValues((state) => ({ ...state, radioField: e.target.value }))
                  }
                >
                  <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
                  <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
                  <FormControlLabel value="option3" control={<Radio />} label="Option 3" />
                  <FormControlLabel
                    value="disabled"
                    disabled
                    control={<Radio />}
                    label="Disabled"
                  />
                </RadioGroup>
              </FormControl>

              {/* Checkboxes */}
              <FormControl>
                <FormLabel>checkboxes</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    label="checkboxA"
                    control={
                      <Checkbox
                        name="checkboxA"
                        checked={formValues.checkboxA === true}
                        onChange={(e) =>
                          setFormValues((state) => ({ ...state, checkboxA: e.target.checked }))
                        }
                      />
                    }
                  />
                  <FormControlLabel
                    label="checkboxB"
                    control={
                      <Checkbox
                        name="checkboxB"
                        checked={formValues.checkboxB === true}
                        onChange={(e) =>
                          setFormValues((state) => ({ ...state, checkboxB: e.target.checked }))
                        }
                      />
                    }
                  />
                  <FormControlLabel
                    label="checkboxC"
                    control={
                      <Checkbox
                        name="checkboxC"
                        checked={formValues.checkboxC === true}
                        onChange={(e) =>
                          setFormValues((state) => ({ ...state, checkboxC: e.target.checked }))
                        }
                      />
                    }
                  />
                </FormGroup>
              </FormControl>

              {/* Date Picker */}
              <DatePicker
                label="dateField"
                value={formValues.dateField as Date | null}
                onChange={(value) => {
                  setFormValues((state) => {
                    const updatedFormValues = { ...state, dateField: value };
                    // Validate after update if field has been blurred
                    if (formMeta.dateField.hasBeenBlurred) {
                      validateOnUpdatedFormValues('dateField', updatedFormValues);
                    }
                    return updatedFormValues;
                  });
                }}
                slotProps={{
                  textField: {
                    onBlur: validateOnBlur('dateField'),
                    error: shouldShowError('dateField'),
                    helperText: getErrorMessage('dateField') || ' ',
                    required: formMeta.dateField.required,
                    fullWidth: true,
                  },
                }}
              />

              {/* File Upload */}
              <FileUpload
                inputLabelText="fileUpload"
                value={formValues.fileUpload as string | null}
                onChangeFile={async (file) => {
                  // Upload to API
                  const formData = new FormData();
                  formData.append('file', file);
                  try {
                    const response = await fetchClient.post('/api/uploads/users', formData);
                    const { url } = (response as { data: { url: string } }).data;
                    setFormValues((state) => {
                      const updatedFormValues = { ...state, fileUpload: url };
                      validateOnUpdatedFormValues('fileUpload', updatedFormValues);
                      return updatedFormValues;
                    });
                  } catch {
                    // Fallback to local URL if API fails
                    const url = URL.createObjectURL(file);
                    setFormValues((state) => {
                      const updatedFormValues = { ...state, fileUpload: url };
                      validateOnUpdatedFormValues('fileUpload', updatedFormValues);
                      return updatedFormValues;
                    });
                  }
                }}
                onDeleteButtonClick={() => {
                  setFormValues((state) => {
                    const updatedFormValues = { ...state, fileUpload: null };
                    validateOnUpdatedFormValues('fileUpload', updatedFormValues);
                    return updatedFormValues;
                  });
                }}
                error={shouldShowError('fileUpload')}
                helperText={getErrorMessage('fileUpload') || ' '}
                required={formMeta.fileUpload.required}
                containerSx={{ width: '300px', height: '200px' }}
              />

              {/* Submit Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={handleFormSubmit}>
                  Submit
                </Button>
                <Button variant="outlined" onClick={handleFormReset}>
                  Reset
                </Button>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              formValues
            </Typography>
            <Box component="pre" sx={{ fontSize: 12, mb: 2, overflowX: 'hidden' }}>
              {JSON.stringify(formValues, null, 2)}
            </Box>
            <Typography variant="h6" gutterBottom>
              formMeta
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              formSubmitAttempted: {formSubmitAttempted.toString()}
            </Typography>
            <Box component="pre" sx={{ fontSize: 12, overflowX: 'hidden' }}>
              {JSON.stringify(formMeta, null, 2)}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default FormSection;
