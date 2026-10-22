import { ReactNode, useState } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className={`bg-[#1E293B] border border-[#334155] rounded-xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto animate-fade-in`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-[#334155] sticky top-0 bg-[#1E293B] z-10">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Button({ children, onClick, variant = 'primary', size = 'md', type = 'button', disabled, className = '' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; size?: 'sm' | 'md' | 'lg'; type?: 'button' | 'submit'; disabled?: boolean; className?: string }) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white hover:opacity-90',
    secondary: 'bg-[#334155] text-white hover:bg-[#475569] border border-[#475569]',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-300 hover:bg-[#334155]',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${variants[variant]} ${sizes[size]} rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
  );
}

export function Input({ label, value, onChange, type = 'text', placeholder, required, disabled }: { label?: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; disabled?: boolean }) {
  return (
    <div>
      {label && <label className="block text-sm text-gray-300 mb-1">{label}{required && <span className="text-red-400"> *</span>}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:border-[#3B82F6] focus:outline-none transition-colors disabled:opacity-50"
      />
    </div>
  );
}

export function Select({ label, value, onChange, options, placeholder }: { label?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) {
  return (
    <div>
      {label && <label className="block text-sm text-gray-300 mb-1">{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:border-[#3B82F6] focus:outline-none">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 3 }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      {label && <label className="block text-sm text-gray-300 mb-1">{label}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-white text-sm focus:border-[#3B82F6] focus:outline-none resize-none" />
    </div>
  );
}

export function Badge({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'purple' }) {
  const variants = {
    default: 'bg-[#334155] text-gray-300',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-[#1E293B] border border-[#334155] rounded-xl ${className}`}>{children}</div>;
}

export function StatCard({ label, value, icon, color, subtitle }: { label: string; value: string | number; icon: ReactNode; color: string; subtitle?: string }) {
  return (
    <Card className="p-5 hover:border-[#3B82F6]/30 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white`}>{icon}</div>
      </div>
    </Card>
  );
}

export function Tabs({ tabs, active, onChange }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-2 border-b border-[#334155] mb-4">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${active === t.id ? 'border-[#3B82F6] text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
          {t.label}{t.count !== undefined && <span className="ml-2 text-xs bg-[#334155] px-1.5 py-0.5 rounded">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Buscar...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex items-center bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2">
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="bg-transparent border-none outline-none text-white ml-2 text-sm w-full" />
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description?: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-600 mb-3">{icon}</div>
      <p className="text-gray-400 font-medium">{title}</p>
      {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-gray-300 text-sm mb-5">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>Confirmar</Button>
      </div>
    </Modal>
  );
}

export function useConfirm() {
  const [state, setState] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} });
  const confirm = (title: string, message: string, onConfirm: () => void) => setState({ open: true, title, message, onConfirm });
  const Component = () => <ConfirmDialog {...state} onClose={() => setState(s => ({ ...s, open: false }))} />;
  return { confirm, Component };
}
