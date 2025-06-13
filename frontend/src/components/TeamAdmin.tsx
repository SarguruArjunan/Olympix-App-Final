import React, { useState, useRef } from 'react';
import { Team } from '../types';
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';
import { getTeamInitials } from '../utils/helpers';

const TeamAdmin: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    Name: '',
    Logo_URL: '',
    Organization: '',
    TagLine: '',
    Color: '#000000'
  });

  const { data: teams, isLoading: teamsLoading, error: teamsError } = useTeams();
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();

  const isLoading = teamsLoading;
  const isSubmitting = createTeamMutation.isPending || updateTeamMutation.isPending;

  const resetForm = () => {
    setFormData({
      Name: '',
      Logo_URL: '',
      Organization: '',
      TagLine: '',
      Color: '#000000'
    });
    setLogoPreview('');
    setEditingTeam(null);
    setIsFormVisible(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (team: Team) => {
    setFormData({
      Name: team.Name,
      Logo_URL: team.Logo_URL,
      Organization: team.Organization,
      TagLine: team.TagLine,
      Color: team.Color
    });
    setLogoPreview(team.Logo_URL || '');
    setEditingTeam(team);
    setIsFormVisible(true);
    
    // Scroll to top smoothly and focus on first field
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const firstInput = document.getElementById('organization');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 200x200 for logos)
        const maxSize = 200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // Try different quality levels until we get under the character limit
          const tryCompress = (quality: number): void => {
            const base64String = canvas.toDataURL('image/jpeg', quality);
            
            // Excel limit is 32,767 characters, leave some buffer
            if (base64String.length < 30000) {
              resolve(base64String);
            } else if (quality > 0.1) {
              // Try lower quality
              tryCompress(quality - 0.1);
            } else {
              // If still too large even at 10% quality, try PNG
              const pngString = canvas.toDataURL('image/png');
              if (pngString.length < 30000) {
                resolve(pngString);
              } else {
                reject(new Error('Image too large even after compression'));
              }
            }
          };
          
          tryCompress(0.8); // Start with 80% quality
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, GIF, etc.)');
      return;
    }

    // Validate file size (max 10MB for processing)
    if (file.size > 10 * 1024 * 1024) {
      alert('Please select an image smaller than 10MB');
      return;
    }

    setIsUploadingLogo(true);

    try {
      const compressedBase64 = await compressImage(file);
      
      // Final safety check
      if (compressedBase64.length > 30000) {
        alert('Image is still too large after compression. Please try a smaller or simpler image.');
        setIsUploadingLogo(false);
        return;
      }
      
      setFormData({ ...formData, Logo_URL: compressedBase64 });
      setLogoPreview(compressedBase64);
      setIsUploadingLogo(false);
    } catch (error) {
      console.error('Image compression error:', error);
      alert('Failed to process image. Please try a different image or smaller file size.');
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, Logo_URL: '' });
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.Name || !formData.Organization || !formData.TagLine) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const teamData = {
        Name: formData.Name,
        Country: '',
        Logo_URL: formData.Logo_URL || '',
        Organization: formData.Organization,
        TagLine: formData.TagLine,
        Color: formData.Color
      };

      if (editingTeam) {
        await updateTeamMutation.mutateAsync({ id: editingTeam.ID, data: teamData });
      } else {
        await createTeamMutation.mutateAsync(teamData);
      }

      resetForm();
    } catch (error: any) {
      console.error('Error saving team:', error);
      
      // Provide more specific error messages
      let errorMessage = editingTeam ? 'Failed to update team' : 'Failed to create team';
      
      if (error?.message?.includes('PayloadTooLargeError') || error?.message?.includes('request entity too large')) {
        errorMessage = 'Team logo is too large. Please try a smaller image or use the Upload Logo button for automatic compression.';
      } else if (error?.message?.includes('Text length must not exceed 32767 characters')) {
        errorMessage = 'Team logo is too large for storage. Please try a smaller or simpler image.';
      } else if (error?.message?.includes('Internal Server Error')) {
        errorMessage = 'Server error occurred. Please try uploading a smaller image or contact support.';
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage += ': ' + error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }

    try {
      await deleteTeamMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (teamsError) {
    return (
      <ErrorMessage 
        title="Error loading teams"
        message="Please try again later."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg text-gray-600">Manage team details and information</p>
        </div>
        <button
          onClick={() => {
            setIsFormVisible(!isFormVisible);
            if (!isFormVisible) {
              // Scroll to top smoothly and focus on first field when opening form
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => {
                const firstInput = document.getElementById('organization');
                if (firstInput) {
                  firstInput.focus();
                }
              }, 100);
            }
          }}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          {isFormVisible ? 'Cancel' : 'Add New Team'}
        </button>
      </div>

      {/* Team Form */}
      {isFormVisible && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {editingTeam ? 'Edit Team' : 'Add New Team'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Logo Upload Section */}
            <div className="border-b border-gray-200 pb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Team Logo</h4>
              
              <div className="flex items-start space-x-6">
                {/* Logo Preview */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Team logo preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-500">No logo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <div className="space-y-3">
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploadingLogo}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingLogo}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isUploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      </button>
                    </div>

                    {logoPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Remove Logo
                      </button>
                    )}

                    <div className="text-sm text-gray-500">
                      <p>• Upload PNG, JPG, or GIF images</p>
                      <p>• Maximum file size: 10MB (automatically compressed)</p>
                      <p>• Images automatically resized to 200x200 pixels</p>
                      <p>• Optimized for Excel storage compatibility</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual URL Input (Alternative) */}
              <div className="mt-4">
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Or enter logo URL manually
                </label>
                <input
                  type="url"
                  id="logo_url"
                  value={formData.Logo_URL}
                  onChange={(e) => {
                    setFormData({ ...formData, Logo_URL: e.target.value });
                    setLogoPreview(e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            {/* Team Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization/Vertical *
                </label>
                <input
                  type="text"
                  id="organization"
                  value={formData.Organization}
                  onChange={(e) => setFormData({ ...formData, Organization: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Enablement & Success"
                  required
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Success Squad"
                  required
                />
              </div>

              <div>
                <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Line *
                </label>
                <input
                  type="text"
                  id="tagline"
                  value={formData.TagLine}
                  onChange={(e) => setFormData({ ...formData, TagLine: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Game On, CustGrSnss"
                  required
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    id="color"
                    value={formData.Color}
                    onChange={(e) => setFormData({ ...formData, Color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.Color}
                    onChange={(e) => setFormData({ ...formData, Color: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="#000000"
                  />
                </div>
              </div>


            </div>

            <div className="flex space-x-4 pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting || isUploadingLogo}
                className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingTeam ? 'Update Team' : 'Create Team'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Teams</h3>
        </div>
        
        {teams && teams.length > 0 ? (
          <>
            {/* Mobile Card Layout */}
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {teams.map((team) => (
                  <div key={team.ID} className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3 flex-1">
                        {/* Team Logo */}
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {team.Logo_URL ? (
                            <img
                              src={team.Logo_URL}
                              alt={`${team.Name} logo`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-lg" style="background-color: ${team.Color}">${getTeamInitials(team.Name)}</div>`;
                                }
                              }}
                            />
                          ) : (
                            <div 
                              className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-lg"
                              style={{ backgroundColor: team.Color }}
                            >
                              {getTeamInitials(team.Name)}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <div 
                              className="w-4 h-4 rounded-full border" 
                              style={{ backgroundColor: team.Color }}
                            ></div>
                            <h4 className="font-semibold text-gray-900">{team.Name}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{team.Organization}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">#{team.ID}</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Tag Line:</span>
                        <span className="ml-1 text-gray-900 italic">"{team.TagLine}"</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(team)}
                        className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(team.ID)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        disabled={deleteTeamMutation.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Logo
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization/Vertical
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tag Line
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Color
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teams.map((team, index) => (
                    <tr key={team.ID} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {index + 1}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                          {team.Logo_URL ? (
                            <img
                              src={team.Logo_URL}
                              alt={`${team.Name} logo`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.innerHTML = `<div class="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-lg" style="background-color: ${team.Color}">${getTeamInitials(team.Name)}</div>`;
                                }
                              }}
                            />
                          ) : (
                            <div 
                              className="w-full h-full rounded-lg flex items-center justify-center text-white font-bold text-lg"
                              style={{ backgroundColor: team.Color }}
                            >
                              {getTeamInitials(team.Name)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="font-medium text-gray-900">{team.Organization}</div>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: team.Color }}
                          ></div>
                          <span className="font-medium text-gray-900">{team.Name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-900">
                        <span className="italic">"{team.TagLine}"</span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border" 
                            style={{ backgroundColor: team.Color }}
                          ></div>
                          <span className="font-mono text-xs">{team.Color}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleEdit(team)}
                            className="text-primary hover:text-primary-dark text-left"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(team.ID)}
                            className="text-red-600 hover:text-red-900 text-left"
                            disabled={deleteTeamMutation.isPending}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState
            title="No teams found"
            description="Create your first team using the 'Add New Team' button above."
            icon={
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121l.196 1.121zM9 12a4 4 0 008 0m-8 0a4 4 0 01-8 0m8 0v4.5c0 .621-.504 1.125-1.125 1.125S8.875 17.121 8.875 16.5V12m8-4a5 5 0 00-10 0v8" />
              </svg>
            }
          />
        )}
      </div>
    </div>
  );
};

export default TeamAdmin; 