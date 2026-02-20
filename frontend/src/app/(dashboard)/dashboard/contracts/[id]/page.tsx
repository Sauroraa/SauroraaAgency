'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Download, FileSignature, Save, Send } from 'lucide-react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToastStore } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';

type ContractPayload = {
  organizer: Record<string, any>;
  artist: Record<string, any>;
  performance: Record<string, any>;
  financial: Record<string, any>;
  logistics: Record<string, any>;
  legal: Record<string, any>;
  signatures: Record<string, any>;
  workflow: Record<string, any>;
};

function Field({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: any;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-[var(--text-secondary)]">{label}</label>
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-dark-500 text-sm outline-none disabled:opacity-60"
      />
    </div>
  );
}

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const addToast = useToastStore((s) => s.addToast);
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'admin' || role === 'manager';
  const isOrganizer = role === 'organizer' || role === 'promoter';
  const [contract, setContract] = useState<ContractPayload | null>(null);
  const [signature, setSignature] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['contract-data', id],
    queryFn: async () => {
      const res = await api.get(`/bookings/${id}/contract-data`);
      return res.data.data || res.data;
    },
  });

  useEffect(() => {
    if (data?.contract) {
      setContract(data.contract);
      setSignature(data.contract?.signatures?.organizerSignatureName || '');
    }
  }, [data]);

  const saveAdmin = useMutation({
    mutationFn: async () => api.patch(`/bookings/${id}/contract-data`, { contract }),
    onSuccess: async () => {
      addToast('success', 'Contrat pre-rempli sauvegarde');
      await refetch();
    },
    onError: (e: any) => addToast('error', e?.response?.data?.message || 'Sauvegarde impossible'),
  });

  const saveOrganizer = useMutation({
    mutationFn: async () => api.patch(`/bookings/${id}/contract-data/organizer`, { contract }),
    onSuccess: async () => {
      addToast('success', 'Contrat complete sauvegarde');
      await refetch();
    },
    onError: (e: any) => addToast('error', e?.response?.data?.message || 'Sauvegarde impossible'),
  });

  const signContract = useMutation({
    mutationFn: async () => api.post(`/bookings/${id}/contract-sign`, { signature }),
    onSuccess: async () => {
      addToast('success', 'Contrat signe et envoye');
      await refetch();
    },
    onError: (e: any) => addToast('error', e?.response?.data?.message || 'Signature impossible'),
  });

  const sendLink = useMutation({
    mutationFn: async () => api.post(`/bookings/${id}/send-contract`, {}),
    onSuccess: () => addToast('success', 'Lien de signature envoye a l organisateur'),
    onError: (e: any) => addToast('error', e?.response?.data?.message || 'Envoi impossible'),
  });

  const downloadPdf = async (endpoint: string, filename: string) => {
    try {
      const res = await api.get(endpoint, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e: any) {
      addToast('error', e?.response?.data?.message || 'Telechargement impossible');
    }
  };

  const setSection = (section: keyof ContractPayload, key: string, value: string) => {
    setContract((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...(prev[section] || {}),
          [key]: value,
        },
      };
    });
  };

  if (isLoading || !contract) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const signed = Boolean(data?.signedAt);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Contrat {data?.referenceCode}</h1>
          <div className="mt-1">
            {signed ? <Badge variant="success">Signe</Badge> : <Badge variant="warning">Non signe</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => downloadPdf(`/bookings/${id}/contract-pdf`, `contrat-${data?.referenceCode}.pdf`)}>
            <Download size={14} /> PDF contrat
          </Button>
          {signed ? (
            <Button variant="ghost" onClick={() => downloadPdf(`/bookings/${id}/invoice`, `facture-${data?.referenceCode}.pdf`)}>
              <Download size={14} /> PDF facture
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">ENTRE LES SOUSSIGNES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Dénomination organisateur" value={contract.organizer.companyName} onChange={(v) => setSection('organizer', 'companyName', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Forme juridique organisateur" value={contract.organizer.legalForm} onChange={(v) => setSection('organizer', 'legalForm', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Siège social" value={contract.organizer.registeredOffice} onChange={(v) => setSection('organizer', 'registeredOffice', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="BCE organisateur" value={contract.organizer.bceNumber} onChange={(v) => setSection('organizer', 'bceNumber', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="TVA organisateur" value={contract.organizer.vatNumber} onChange={(v) => setSection('organizer', 'vatNumber', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Représenté par (orga)" value={contract.organizer.representativeName} onChange={(v) => setSection('organizer', 'representativeName', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Fonction (orga)" value={contract.organizer.representativeRole} onChange={(v) => setSection('organizer', 'representativeRole', v)} disabled={!isAdmin && !isOrganizer} />
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">ARTISTE / GROUPE / DJ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Nom artistique" value={contract.artist.stageName} onChange={(v) => setSection('artist', 'stageName', v)} disabled={!isAdmin} />
          <Field label="Nom légal / société" value={contract.artist.legalNameOrCompany} onChange={(v) => setSection('artist', 'legalNameOrCompany', v)} disabled={!isAdmin} />
          <Field label="Forme juridique" value={contract.artist.legalForm} onChange={(v) => setSection('artist', 'legalForm', v)} disabled={!isAdmin} />
          <Field label="Adresse" value={contract.artist.address} onChange={(v) => setSection('artist', 'address', v)} disabled={!isAdmin} />
          <Field label="BCE artiste" value={contract.artist.bceNumber} onChange={(v) => setSection('artist', 'bceNumber', v)} disabled={!isAdmin} />
          <Field label="TVA artiste" value={contract.artist.vatNumber} onChange={(v) => setSection('artist', 'vatNumber', v)} disabled={!isAdmin} />
          <Field label="Représenté par (artiste)" value={contract.artist.representativeName} onChange={(v) => setSection('artist', 'representativeName', v)} disabled={!isAdmin} />
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">ARTICLE 2 – DETAILS DE LA PRESTATION</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Type d'événement" value={contract.performance.eventType} onChange={(v) => setSection('performance', 'eventType', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Date" value={contract.performance.eventDate} onChange={(v) => setSection('performance', 'eventDate', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Lieu" value={contract.performance.venue} onChange={(v) => setSection('performance', 'venue', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Adresse complète" value={contract.performance.fullAddress} onChange={(v) => setSection('performance', 'fullAddress', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Horaire d'arrivée" value={contract.performance.arrivalTime} onChange={(v) => setSection('performance', 'arrivalTime', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Horaire de prestation" value={contract.performance.performanceTime} onChange={(v) => setSection('performance', 'performanceTime', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Durée prestation" value={contract.performance.duration} onChange={(v) => setSection('performance', 'duration', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Nombre de sets" value={contract.performance.setsCount} onChange={(v) => setSection('performance', 'setsCount', v)} disabled={!isAdmin && !isOrganizer} />
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">ARTICLE 3 – CONDITIONS FINANCIERES</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Cachet (EUR)" value={contract.financial.feeAmount} onChange={(v) => setSection('financial', 'feeAmount', v)} disabled={!isAdmin} />
          <Field label="TVA incluse ? (true/false)" value={String(contract.financial.feeVatIncluded ?? false)} onChange={(v) => setSection('financial', 'feeVatIncluded', v)} disabled={!isAdmin} />
          <Field label="Acompte (%)" value={contract.financial.depositPercent} onChange={(v) => setSection('financial', 'depositPercent', v)} disabled={!isAdmin} />
          <Field label="Solde (event_day / X jours)" value={contract.financial.balanceDueType} onChange={(v) => setSection('financial', 'balanceDueType', v)} disabled={!isAdmin} />
          <Field label="Jours après facturation" value={contract.financial.balanceDueDaysAfterInvoice} onChange={(v) => setSection('financial', 'balanceDueDaysAfterInvoice', v)} disabled={!isAdmin} />
          <Field label="IBAN" value={contract.financial.iban} onChange={(v) => setSection('financial', 'iban', v)} disabled={!isAdmin} />
          <Field label="BIC" value={contract.financial.bic} onChange={(v) => setSection('financial', 'bic', v)} disabled={!isAdmin} />
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">ARTICLES 7, 11, 16</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Transport pris en charge par" value={contract.logistics.transportCoveredBy} onChange={(v) => setSection('logistics', 'transportCoveredBy', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Hébergement" value={contract.logistics.accommodation} onChange={(v) => setSection('logistics', 'accommodation', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Catering / Hospitality rider" value={contract.logistics.hospitalityRider} onChange={(v) => setSection('logistics', 'hospitalityRider', v)} disabled={!isAdmin && !isOrganizer} />
          <Field label="Exclusivité rayon (km)" value={contract.legal.exclusivityRadiusKm} onChange={(v) => setSection('legal', 'exclusivityRadiusKm', v)} disabled={!isAdmin} />
          <Field label="Exclusivité période (jours)" value={contract.legal.exclusivityDays} onChange={(v) => setSection('legal', 'exclusivityDays', v)} disabled={!isAdmin} />
          <Field label="Fait à" value={contract.legal.placeSigned} onChange={(v) => setSection('legal', 'placeSigned', v)} disabled={!isAdmin && !isOrganizer} />
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold mb-4">Signature organisateur</h2>
        <Field
          label="Nom + signature (texte)"
          value={signature}
          onChange={setSignature}
          disabled={!isOrganizer || signed}
          placeholder="Ex: Jean Dupont"
        />
      </Card>

      <div className="flex flex-wrap gap-2">
        {isAdmin ? (
          <>
            <Button onClick={() => saveAdmin.mutate()} isLoading={saveAdmin.isPending}>
              <Save size={14} /> Sauvegarder pre-remplissage admin
            </Button>
            <Button variant="ghost" onClick={() => sendLink.mutate()} isLoading={sendLink.isPending}>
              <Send size={14} /> Envoyer lien signature a l orga
            </Button>
          </>
        ) : null}

        {isOrganizer ? (
          <>
            <Button onClick={() => saveOrganizer.mutate()} isLoading={saveOrganizer.isPending}>
              <Save size={14} /> Sauvegarder mes infos
            </Button>
            <Button onClick={() => signContract.mutate()} isLoading={signContract.isPending} disabled={!signature.trim() || signed}>
              <FileSignature size={14} /> Signer et envoyer
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
