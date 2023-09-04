import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import CampaignsService from '@services/campaigns';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useBeneficiaries } from 'src/api/beneficiaries';

type Props = {
  open: boolean;
  onClose: () => void;
  onOk: () => void;
};

const CampaignAssignBenficiariesModal = ({ open, onClose, onOk }: Props) => {
  const [selectedBeneficiaries, setSelectedBeneficiaries] = useState<string[]>([]);
  const [formattedSelect, setFormattedSelect] = useState<any[]>([]);

  const handleSelectBeneficiaries = async (e: SelectChangeEvent<string[]>) => {
    const { value } = e.target;

    // Create an array of objects with 'phone' and 'uuid' properties
    const formattedSelected = beneficiaries
      .filter((benef) => value.includes(benef.name))
      .map((benef) => ({
        phone: benef.phone,
        uuid: benef.uuid,
        walletAddress: benef.walletAddress,
        name: benef.name,
      }));

    setFormattedSelect(formattedSelected);
    setSelectedBeneficiaries(value as string[]);
  };

  const { beneficiaries } = useBeneficiaries();
  const { enqueueSnackbar } = useSnackbar();

  const { mutate } = useMutation({
    mutationFn: async (withDetails) => {
      const response = await CampaignsService.bulkAddAudiences(withDetails);
      return response.data;
    },
    onError: () => {
      enqueueSnackbar('Error registering audiences', { variant: 'error' });
    },
    onSuccess: () => {
      enqueueSnackbar('Audiences registered successfully', { variant: 'success' });
    },
  });

  const onRegister = async () => {
    try {
      const withDetails: any = formattedSelect.map((d) => ({
        details: {
          ...d,
        },
      }));
      console.log('withDetails', withDetails);
      // mutate(withDetails);
      // onClose();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Register Beneficiaries.</DialogTitle>

      <DialogContent sx={{ color: 'text.secondary' }}>
        Register Existing Beneficiaries as audience of the campaign.
      </DialogContent>

      <Stack sx={{ p: 2 }} spacing={5}>
        <Select
          labelId="demo-multiple-chip-label"
          id="demo-multiple-chip"
          multiple
          value={selectedBeneficiaries}
          onChange={handleSelectBeneficiaries}
          fullWidth
          input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value: any) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {beneficiaries.map((benef) => (
            <MenuItem key={benef.name} value={benef.name}>
              <Checkbox checked={selectedBeneficiaries.indexOf(benef.name) > -1} />
              <ListItemText primary={benef.name} />
            </MenuItem>
          ))}
        </Select>
      </Stack>
      <DialogActions>
        <Button variant="text" color="success" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="text" onClick={onRegister} autoFocus>
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampaignAssignBenficiariesModal;
