/**
 * Team Allocation Management Page for Admins
 * Created by CaptainCode
 * Complete team management interface with member assignments and team creation
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, X } from 'lucide-react';
import { teamsAPI, adminAPI } from '@/shared/api/client';
import { useAsyncResource, unwrapData } from '@/shared/api/live';
import {
  ActionButton,
  Card,
  CircleAvatar,
  PageHeading,
  StatusPill,
} from '@/shared/ui/talentFlow';

interface TeamMember {
  id: number;
  userId: number;
  teamId: number;
  role: string;
  joinedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Team {
  id: number;
  name: string;
  description?: string;
  capacity?: number;
  courseId?: number | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  members?: TeamMember[];
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export function TeamAllocationPage() {
  const navigate = useNavigate();
  const { data: teams, loading: teamsLoading, error: teamsError, refetch: refetchTeams } = useAsyncResource(
    () => teamsAPI.listTeams().then(unwrapData),
    []
  );

  const { data: users } = useAsyncResource(
    () => adminAPI.listUsers().then(unwrapData),
    []
  );

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [memberRole, setMemberRole] = useState('member');
  const [loadingMembers, setLoadingMembers] = useState(false);
  // Fetch team members when a team is selected
  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  const fetchTeamMembers = async (teamId: number) => {
    try {
      setLoadingMembers(true);
      const response = await teamsAPI.listMembers(teamId);
      setTeamMembers(response?.data?.data || response?.data?.members || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }
    try {
      await teamsAPI.deleteTeam(teamId);
      await refetchTeams();
      if (selectedTeam?.id === teamId) {
        setSelectedTeam(null);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedTeam || !selectedUserId) {
      alert('Please select a user');
      return;
    }

    try {
      await teamsAPI.addMember(selectedTeam.id, selectedUserId, memberRole);
      await fetchTeamMembers(selectedTeam.id);
      setSelectedUserId(null);
      setMemberRole('member');
      setShowMemberForm(false);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error adding member');
    }
  };

  const handleRemoveMember = async (teamId: number, userId: number) => {
    if (!window.confirm('Remove this member from the team?')) {
      return;
    }

    try {
      await teamsAPI.removeMember(teamId, userId);
      await fetchTeamMembers(teamId);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const getAvailableUsers = () => {
    const assignedUserIds = teamMembers.map(m => m.userId);
    return users.filter((u: User) => !assignedUserIds.includes(u.id));
  };

  if (teamsError) {
    return (
      <div className="p-6">
        <Card className="bg-red-50 border-red-200 text-red-700">
          Error loading teams: {teamsError}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-8">
        <div className="flex justify-between items-center">
          <div>
            <PageHeading title="Team Allocation" />
            <p className="text-gray-600 mt-2">Manage teams and assign learners to different groups</p>
          </div>
          <ActionButton
            variant="primary"
            onClick={() => navigate('/admin/team-allocation/create')}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Create Team
          </ActionButton>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams List */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <h3 className="font-semibold text-gray-900 mb-4">Teams ({teams.length || 0})</h3>
              {teamsLoading ? (
                <p className="text-gray-500 text-sm">Loading teams...</p>
              ) : teams.length === 0 ? (
                <p className="text-gray-500 text-sm">No teams created yet</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {teams.map((team: Team) => (
                    <div
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedTeam?.id === team.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{team.name}</p>
                          <p className="text-xs text-gray-600 mt-1">{team.description}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Users size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{team.memberCount || 0} members</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Team Details */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <Card>
                {/* Team Header */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedTeam.name}</h2>
                      <p className="text-gray-600 text-sm mt-1">{selectedTeam.description}</p>
                      <div className="flex gap-4 mt-3 text-sm">
                        <span className="text-gray-600">
                          Capacity: <span className="font-medium">{selectedTeam.capacity || 'Unlimited'}</span>
                        </span>
                        <span className="text-gray-600">
                          Created: <span className="font-medium">{new Date(selectedTeam.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <ActionButton
                        variant="secondary"
                        onClick={() => navigate(`/admin/team-allocation/${selectedTeam.id}/edit`)}
                        className="flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Edit
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        onClick={() => handleDeleteTeam(selectedTeam.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </ActionButton>
                    </div>
                  </div>
                </div>

                {/* Members Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">Team Members ({teamMembers.length})</h3>
                    {selectedTeam.capacity && teamMembers.length >= selectedTeam.capacity ? (
                      <StatusPill label="Team Full" tone="warning" />
                    ) : (
                      <ActionButton
                        variant="primary"
                        onClick={() => setShowMemberForm(!showMemberForm)}
                        className="flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add Member
                      </ActionButton>
                    )}
                  </div>

                  {/* Add Member Form */}
                  {showMemberForm && (
                    <Card className="bg-blue-50 border border-blue-200 p-3 mb-4">
                      <div className="space-y-3">
                        <select
                          value={selectedUserId || ''}
                          onChange={(e) => setSelectedUserId(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">Select a user to add...</option>
                          {getAvailableUsers().map((user: User) => (
                            <option key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} ({user.role})
                            </option>
                          ))}
                        </select>

                        <select
                          value={memberRole}
                          onChange={(e) => setMemberRole(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="member">Member</option>
                          <option value="lead">Lead</option>
                          <option value="moderator">Moderator</option>
                        </select>

                        <div className="flex gap-2">
                          <ActionButton
                            variant="primary"
                            onClick={handleAddMember}
                            className="flex-1"
                          >
                            Add Member
                          </ActionButton>
                          <ActionButton
                            variant="secondary"
                            onClick={() => {
                              setShowMemberForm(false);
                              setSelectedUserId(null);
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </ActionButton>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Members List */}
                  {loadingMembers ? (
                    <p className="text-gray-500 text-sm">Loading members...</p>
                  ) : teamMembers.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Users size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">No members in this team yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {teamMembers.map((member) => {
                        const user = member.user;
                        const initials = user
                          ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
                          : '??';
                        return (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <CircleAvatar initials={initials} tone="primary" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm">
                                  {user ? `${user.firstName} ${user.lastName}` : `User ${member.userId}`}
                                </p>
                                <p className="text-xs text-gray-600">{user?.email || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusPill label={member.role} tone="success" />
                              <ActionButton
                                variant="danger"
                                onClick={() => handleRemoveMember(selectedTeam.id, member.userId)}
                                className="p-1"
                              >
                                <X size={16} />
                              </ActionButton>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center h-96 text-center">
                <Users size={48} className="text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">Select a team to view and manage members</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
