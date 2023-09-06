'use client';

import { useCallback } from 'react';
// @mui
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Tooltip from '@mui/material/Tooltip';
// routes
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
// _mock
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import {
  emptyRows,
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSelectedAction,
  useTable,
} from 'src/components/table';
// types
//
import { Button } from '@mui/material';
import { RouterLink } from '@routes/components';
import CampaignsService from '@services/campaigns';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useCampaigns } from 'src/api/campaigns';
import { ICampaignItem } from 'src/types/campaigns';
import CampaignsTableRow from './campaigns-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', width: 200 },
  { id: 'startTime', label: 'Start Time', width: 150 },
  { id: 'type', label: 'Type', width: 150 },
  { id: 'status', label: 'Status', width: 150 },
  { id: 'transport', label: 'Transport', width: 150 },
  { id: 'totalAudiences', label: 'Total Audiences', width: 150 },
  { id: '', width: 20 },
];

// ----------------------------------------------------------------------

export default function BeneficiariesListView() {
  const table = useTable();

  const { campaigns, meta } = useCampaigns();

  const { push } = useRouter();

  const settings = useSettingsContext();

  const confirm = useBoolean();

  const { enqueueSnackbar } = useSnackbar();

  const denseHeight = table.dense ? 52 : 72;

  const notFound = !campaigns.length;

  const handleViewRow = useCallback(
    (id: number) => {
      push(paths.dashboard.general.campaigns.details(id));
    },
    [push]
  );

  const handleEditRow = useCallback(
    (id: number) => {
      push(paths.dashboard.general.campaigns.edit(id));
    },
    [push]
  );

  const removeCampaign = useMutation({
    mutationFn: async (id: string) => {
      const response = await CampaignsService.remove(id);
      return response.data;
    },
    onError: () => {
      enqueueSnackbar('Error Removing Campaigns', { variant: 'error' });
    },
    onSuccess: () => {
      enqueueSnackbar('Campaign Removed Successfully', { variant: 'success' });
    },
  });

  const handleRemoveCampaign = () => {
    const id = table.selected;
    if (id.length > 1) {
      enqueueSnackbar('Please select only one campaign at a Time', { variant: 'error' });
      return;
    }
    removeCampaign.mutate(id[0]);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Campaigns: List"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'List' }]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.general.campaigns.add}
            variant="outlined"
            startIcon={<Iconify icon="mingcute:add-line" />}
            color="success"
          >
            Add Campaign
          </Button>
        }
      />

      <Card>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={campaigns.length}
            onSelectAllRows={(checked) =>
              table.onSelectAllRows(
                checked,
                campaigns.map((row: ICampaignItem) => row.name.toString())
              )
            }
            action={
              <Tooltip title="Delete">
                <IconButton color="primary" onClick={handleRemoveCampaign}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Tooltip>
            }
          />

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={campaigns.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    campaigns.map((row: ICampaignItem) => String(row.id))
                  )
                }
              />

              <TableBody>
                {campaigns.map((row) => (
                  <CampaignsTableRow
                    key={row.id}
                    row={row}
                    selected={table.selected.includes(String(row.id))}
                    onEditRow={() => handleEditRow(row.id)}
                    onSelectRow={() => table.onSelectRow(String(row.id))}
                    onViewRow={() => handleViewRow(row.id)}
                  />
                ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table?.page, table?.rowsPerPage, meta?.total || 0)}
                />

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          count={meta?.total || 0}
          page={table.page}
          rowsPerPage={table?.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          //
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
  );
}
