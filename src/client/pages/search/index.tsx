import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Paper,
  Divider,
  IconButton,
  Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CasinoIcon from '@mui/icons-material/Casino';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useState, useEffect, useCallback } from 'react';
import Nav from 'client/components/Nav';
import fetchClient from 'client/helpers/fetchClient';

// Types
type SearchResult = {
  id: string;
  word: string;
  wordType: string | null;
  definition: string;
  score: number;
  highlight: {
    word?: string[];
    definition?: string[];
  } | null;
};

type SearchResponse = {
  total: number;
  offset: number;
  limit: number;
  hits: SearchResult[];
};

type AutocompleteResponse = {
  suggestions: string[];
};

type WordDefinition = {
  wordType: string | null;
  definition: string;
};

type WordLookupResponse = {
  word: string;
  definitions: WordDefinition[];
};

type RandomWordResponse = {
  word: string;
  wordType: string | null;
  definition: string;
};

type SearchProps = {
  currentUser: Record<string, any> | null;
  loadCookieSession: () => Promise<void>;
};

const RESULTS_PER_PAGE = 10;

const WORD_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'n.', label: 'Noun (n.)' },
  { value: 'v.', label: 'Verb (v.)' },
  { value: 'adj.', label: 'Adjective (adj.)' },
  { value: 'adv.', label: 'Adverb (adv.)' },
  { value: 'prep.', label: 'Preposition (prep.)' },
  { value: 'conj.', label: 'Conjunction (conj.)' },
  { value: 'interj.', label: 'Interjection (interj.)' },
];

const SEARCH_FIELDS = [
  { value: 'all', label: 'All Fields' },
  { value: 'word', label: 'Word Only' },
  { value: 'definition', label: 'Definition Only' },
];

function Search({ currentUser, loadCookieSession }: SearchProps) {
  const userEmail = currentUser?.email || '';

  // Search state
  const [query, setQuery] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [wordTypeFilter, setWordTypeFilter] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Autocomplete state
  const [autocompleteOptions, setAutocompleteOptions] = useState<string[]>([]);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);

  // Word lookup state
  const [lookupWord, setLookupWord] = useState('');
  const [lookupResult, setLookupResult] = useState<WordLookupResponse | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Random word state
  const [randomWord, setRandomWord] = useState<RandomWordResponse | null>(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);

  // Debounced autocomplete
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setAutocompleteOptions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingAutocomplete(true);
      const data = await fetchClient.get<AutocompleteResponse>(
        `/api/v2/dictionary/autocomplete?q=${encodeURIComponent(query)}&limit=8`,
      );
      setAutocompleteOptions(data.suggestions || []);
      setIsLoadingAutocomplete(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Search function
  const handleSearch = useCallback(
    async (searchQuery: string, pageNum: number = 1) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setTotal(0);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      const offset = (pageNum - 1) * RESULTS_PER_PAGE;
      let url = `/api/v2/dictionary/search?q=${encodeURIComponent(searchQuery)}&limit=${RESULTS_PER_PAGE}&offset=${offset}&field=${searchField}`;

      if (wordTypeFilter) {
        url += `&wordType=${encodeURIComponent(wordTypeFilter)}`;
      }

      const data = await fetchClient.get<SearchResponse>(url);

      setResults(data.hits || []);
      setTotal(data.total || 0);
      setPage(pageNum);
      setIsSearching(false);
    },
    [searchField, wordTypeFilter],
  );

  // Handle search submit
  const handleSearchSubmit = () => {
    setPage(1);
    handleSearch(query, 1);
  };

  // Handle page change
  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    handleSearch(query, newPage);
  };

  // Word lookup
  const handleWordLookup = async () => {
    if (!lookupWord.trim()) return;

    setIsLookingUp(true);
    setLookupError('');
    setLookupResult(null);

    try {
      const data = await fetchClient.get<WordLookupResponse>(
        `/api/v2/dictionary/word/${encodeURIComponent(lookupWord.toLowerCase())}`,
      );
      setLookupResult(data);
    } catch {
      setLookupError(`Word "${lookupWord}" not found`);
    }

    setIsLookingUp(false);
  };

  // Random word
  const handleRandomWord = async () => {
    setIsLoadingRandom(true);
    const data = await fetchClient.get<RandomWordResponse>('/api/v2/dictionary/random');
    setRandomWord(data);
    setIsLoadingRandom(false);
  };

  // Load random word on mount
  useEffect(() => {
    handleRandomWord();
  }, []);

  const totalPages = Math.ceil(total / RESULTS_PER_PAGE);

  return (
    <Box className="app">
      <Nav userEmail={userEmail} loadCookieSession={loadCookieSession} />
      <Box className="content">
        <Container maxWidth="lg">
          <Box sx={{ py: 3 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
              Dictionary Search
            </Typography>

            <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
              {/* Main Search Section */}
              <Box sx={{ flex: 2 }}>
                {/* Search Input with Autocomplete */}
                <Autocomplete
                  freeSolo
                  options={autocompleteOptions}
                  loading={isLoadingAutocomplete}
                  inputValue={query}
                  onInputChange={(_, value) => setQuery(value)}
                  onChange={(_, value) => {
                    if (value) {
                      setQuery(value);
                      handleSearch(value, 1);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search for a word or definition..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchSubmit();
                        }
                      }}
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <>
                              {isSearching || isLoadingAutocomplete ? (
                                <CircularProgress size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                />

                {/* Search Filters */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    mt: 2,
                    mb: 3,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Search In</InputLabel>
                    <Select
                      value={searchField}
                      label="Search In"
                      onChange={(e) => setSearchField(e.target.value)}
                    >
                      {SEARCH_FIELDS.map((field) => (
                        <MenuItem key={field.value} value={field.value}>
                          {field.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Word Type</InputLabel>
                    <Select
                      value={wordTypeFilter}
                      label="Word Type"
                      onChange={(e) => setWordTypeFilter(e.target.value)}
                    >
                      {WORD_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button variant="contained" onClick={handleSearchSubmit} disabled={isSearching}>
                    Search
                  </Button>
                </Box>

                {/* Results Count */}
                {hasSearched && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {total} result{total !== 1 ? 's' : ''} found
                    {wordTypeFilter && ` for ${wordTypeFilter}`}
                  </Typography>
                )}

                {/* Search Results */}
                <Stack spacing={2}>
                  {results.map((result) => (
                    <Card key={result.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography
                            variant="h6"
                            component="span"
                            sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                            onClick={() => {
                              setLookupWord(result.word);
                              handleWordLookup();
                            }}
                          >
                            {result.word}
                          </Typography>
                          {result.wordType && (
                            <Chip
                              label={result.wordType}
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={() => {
                                setWordTypeFilter(result.wordType || '');
                                handleSearch(query, 1);
                              }}
                              sx={{ cursor: 'pointer' }}
                            />
                          )}
                        </Box>
                        <Typography variant="body1" color="text.secondary">
                          {result.definition}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>

                {/* No Results */}
                {hasSearched && results.length === 0 && !isSearching && (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No results found for "{query}"
                  </Typography>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                )}
              </Box>

              {/* Sidebar */}
              <Box sx={{ flex: 1, minWidth: 300 }}>
                {/* Random Word Section */}
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CasinoIcon color="primary" />
                      Word of the Day
                    </Typography>
                    <IconButton size="small" onClick={handleRandomWord} disabled={isLoadingRandom}>
                      {isLoadingRandom ? <CircularProgress size={20} /> : <RefreshIcon />}
                    </IconButton>
                  </Box>
                  {randomWord && (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h5" color="primary">
                          {randomWord.word}
                        </Typography>
                        {randomWord.wordType && (
                          <Chip label={randomWord.wordType} size="small" variant="outlined" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {randomWord.definition}
                      </Typography>
                    </>
                  )}
                </Paper>

                <Divider sx={{ my: 3 }} />

                {/* Word Lookup Section */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Word Lookup
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Get all definitions for a specific word
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Enter a word..."
                      value={lookupWord}
                      onChange={(e) => setLookupWord(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleWordLookup();
                        }
                      }}
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      onClick={handleWordLookup}
                      disabled={isLookingUp || !lookupWord.trim()}
                    >
                      {isLookingUp ? <CircularProgress size={20} /> : 'Look Up'}
                    </Button>
                  </Box>

                  {lookupError && (
                    <Typography color="error" sx={{ mt: 2 }}>
                      {lookupError}
                    </Typography>
                  )}

                  {lookupResult && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        {lookupResult.word}
                      </Typography>
                      <Stack spacing={1}>
                        {lookupResult.definitions.map((def, index) => (
                          <Box key={index}>
                            {def.wordType && (
                              <Chip
                                label={def.wordType}
                                size="small"
                                variant="outlined"
                                sx={{ mb: 0.5 }}
                              />
                            )}
                            <Typography variant="body2" color="text.secondary">
                              {def.definition}
                            </Typography>
                            {index < lookupResult.definitions.length - 1 && (
                              <Divider sx={{ mt: 1 }} />
                            )}
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Search;
