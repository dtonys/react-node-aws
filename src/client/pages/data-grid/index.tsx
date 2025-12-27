import { useState, useEffect, RefObject } from 'react';
import { Box, Container, Typography, CircularProgress, Alert } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import Nav from 'client/components/Nav';
import fetchClient from 'client/helpers/fetchClient';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

type DictionaryRow = {
  id: string;
  word: string;
  definition: string;
  wordType: string | null;
};

type DictionaryApiResponse = {
  total: number;
  offset: number;
  limit: number;
  hits: DictionaryRow[];
};

const columnDefs: ColDef<DictionaryRow>[] = [
  { field: 'word', headerName: 'Word', width: 180, filter: true, sortable: true },
  { field: 'wordType', headerName: 'Type', width: 120, filter: true, sortable: true },
  { field: 'definition', headerName: 'Definition', flex: 1, filter: true, sortable: true },
];

type DataGridPageProps = {
  currentUserRef: RefObject<Record<string, any> | null>;
  loadCookieSession: () => Promise<void>;
};

function DataGridPage({ currentUserRef, loadCookieSession }: DataGridPageProps) {
  const currentUser = currentUserRef.current;
  const [rowData, setRowData] = useState<DictionaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchDictionaryEntries() {
      setLoading(true);
      setError(null);
      const response = (await fetchClient.get(
        '/api/v2/dictionary/all?limit=10000',
      )) as DictionaryApiResponse;
      setRowData(response.hits);
      setTotal(response.total);
      setLoading(false);
    }

    fetchDictionaryEntries();
  }, []);

  return (
    <Box className="app">
      <Nav
        userEmail={currentUser?.email || ''}
        isEmailVerified={Boolean(currentUser?.emailVerified)}
        loadCookieSession={loadCookieSession}
      />
      <Box className="content">
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Data Grid
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {loading
                ? 'Loading dictionary entries...'
                : `${total.toLocaleString()} dictionary entries (A-Z)`}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress size={48} />
              </Box>
            ) : (
              <Box sx={{ height: 600, width: '100%' }}>
                <AgGridReact
                  rowData={rowData}
                  columnDefs={columnDefs}
                  pagination={true}
                  paginationPageSize={25}
                  paginationPageSizeSelector={[10, 25, 50, 100]}
                  domLayout="normal"
                />
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default DataGridPage;
