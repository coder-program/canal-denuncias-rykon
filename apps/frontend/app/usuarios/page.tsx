'use client';

import { useState, useEffect } from 'react';
import PrivateLayout from '@/components/layouts/PrivateLayout';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Shield,
  UserCheck,
  UserX,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  blockedReason?: string;
  createdAt: string;
  updatedAt?: string;
}

interface UserFormData {
  email: string;
  fullName: string;
  password: string;
  role: string;
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState<'create' | 'edit' | 'delete' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    fullName: '',
    password: '',
    role: 'INVESTIGATOR',
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = roleFilter !== 'all' ? { role: roleFilter } : {};
      const response = await apiClient.get('/users', { params });
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      ADMIN: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Administrador' },
      INVESTIGATOR: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Investigador' },
      REPORTER: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Denunciante' },
      AUDITOR: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Auditor' },
      PUBLIC: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Público' },
    };
    return badges[role] || badges['PUBLIC'];
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormData({
      email: '',
      fullName: '',
      password: '',
      role: 'INVESTIGATOR',
      isActive: true,
    });
    setShowModal('create');
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      password: '',
      role: user.role,
      isActive: user.isActive,
    });
    setShowModal('edit');
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowModal('delete');
  };

  const handleSaveUser = async () => {
    try {
      setSaving(true);

      // Validações
      if (!formData.fullName || !formData.email) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      if (showModal === 'create' && !formData.password) {
        toast.error('A senha é obrigatória para novos usuários');
        return;
      }

      if (showModal === 'create') {
        // Criar novo usuário
        await apiClient.post('/users', formData);
        toast.success('Usuário criado com sucesso!');
      } else if (showModal === 'edit' && selectedUser) {
        // Atualizar usuário
        const updateData: any = {
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          isActive: formData.isActive,
        };

        // Só incluir senha se foi preenchida
        if (formData.password) {
          updateData.password = formData.password;
        }

        await apiClient.patch(`/users/${selectedUser.id}`, updateData);
        toast.success('Usuário atualizado com sucesso!');
      }

      setShowModal(null);
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      const message = error.response?.data?.message || 'Erro ao salvar usuário';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);
      await apiClient.delete(`/users/${selectedUser.id}`);
      toast.success('Usuário excluído com sucesso!');
      setShowModal(null);
      loadUsers();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      const message = error.response?.data?.message || 'Erro ao excluir usuário';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <PrivateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestão de Usuários</h1>
            <p className="text-slate-600">Gerenciar usuários e permissões do sistema</p>
          </div>
          <button onClick={handleCreateUser} className="btn-primary">
            <Plus className="w-5 h-5 mr-2 inline-block" />
            Novo Usuário
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary-500 focus:outline-none min-w-[200px]"
            >
              <option value="all">Todas as Funções</option>
              <option value="ADMIN">Administrador</option>
              <option value="INVESTIGATOR">Investigador</option>
              <option value="REPORTER">Denunciante</option>
              <option value="AUDITOR">Auditor</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary-50 to-secondary-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      Usuário
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      E-mail
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      Função
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      Criado em
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const roleBadge = getRoleBadge(user.role);

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-secondary-50/50 transition-all"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="font-semibold text-slate-900">{user.fullName}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">{user.email}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${roleBadge.color}`}
                          >
                            <Shield className="w-3 h-3" />
                            {roleBadge.label}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {user.isActive && !user.isBlocked ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                              <UserCheck className="w-3 h-3" />
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                              <UserX className="w-3 h-3" />
                              {user.isBlocked ? 'Bloqueado' : 'Inativo'}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showModal === 'create' || showModal === 'edit') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">
                {showModal === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
              </h3>
              <button
                onClick={() => setShowModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveUser();
              }}
            >
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="João Silva"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">E-mail *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="joao.silva@empresa.com"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Função</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                >
                  <option value="AUDITOR">Auditor (somente leitura)</option>
                  <option value="INVESTIGATOR">Investigador</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="REPORTER">Denunciante</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {showModal === 'create' ? 'Senha *' : 'Nova Senha (deixe em branco para manter)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="input-field"
                  required={showModal === 'create'}
                  minLength={6}
                />
                <p className="text-xs text-slate-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="active" className="text-sm font-semibold text-slate-700">
                  Usuário ativo
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(null)}
                  className="flex-1 btn-secondary"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 inline-block animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2 inline-block" />
                      {showModal === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showModal === 'delete' && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Confirmar Exclusão</h3>
              <button
                onClick={() => setShowModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-center text-slate-600">
                Tem certeza que deseja excluir o usuário <strong>{selectedUser.fullName}</strong>?
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(null)}
                className="flex-1 btn-secondary"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 inline-block animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Excluir'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PrivateLayout>
  );
}
