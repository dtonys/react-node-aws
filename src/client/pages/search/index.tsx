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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import Nav from 'client/components/Nav';
import fetchClient from 'client/helpers/fetchClient';

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

type SearchProps = {
  currentUser: Record<string, any> | null;
  loadCookieSession: () => Promise<void>;
};

function Search({ currentUser, loadCookieSession }: SearchProps) {
  const userEmail = currentUser?.email || '';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotal(0);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    const data = await fetchClient.get<SearchResponse>(
      `/api/v2/dictionary/search?q=${encodeURIComponent(searchQuery)}&limit=20`
    );

    setResults(data.hits || []);
    setTotal(data.total || 0);
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  return (
    <Box className="app">
      <Nav userEmail={userEmail} loadCookieSession={loadCookieSession} />
      <Box className="content">
        <Container maxWidth="md">
          <Box sx={{ py: 3 }}>
            <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
              Dictionary Search
            </Typography>

            <TextField
              fullWidth
              placeholder="Search for a word or definition..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: isSearching ? (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{ mb: 3 }}
            />

            {hasSearched && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {total} result{total !== 1 ? 's' : ''} found
              </Typography>
            )}

            <Stack spacing={2}>
              {results.map((result) => (
                <Card key={result.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6" component="span">
                        {result.word}
                      </Typography>
                      {result.wordType && (
                        <Chip
                          label={result.wordType}
                          size="small"
                          variant="outlined"
                          color="primary"
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

            {hasSearched && results.length === 0 && !isSearching && (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No results found for "{query}"
              </Typography>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Search;

