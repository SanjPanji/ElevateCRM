'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import type { LeadWithDetails } from '@/types';
import { ScheduleConsultationModal } from './ScheduleConsultationModal';
import { LeadStatusBadge } from './LeadStatusBadge';
import { Calendar, Clock, Phone, User, GraduationCap, Target, History, Wallet, CheckCircle, Edit2, Save, X } from 'lucide-react';

interface LeadDetailsProps {
  lead: LeadWithDetails;
  onUpdateNotes?: (notes: string) => void;
}

export function LeadDetails({ lead }: LeadDetailsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [consultantNotes, setConsultantNotes] = useState(lead.consultant_notes || '');

  const getMeetingStatusLabel = (status: string) => {
    switch (status) {
      case 'not_scheduled': return 'Not Scheduled';
      case 'scheduled': return 'Scheduled';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Info Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Client Information</h3>
            <div className="mt-2">
              <LeadStatusBadge status={lead.meeting_status} />
            </div>
          </div>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Calendar className="h-4 w-4 mr-1" />
            Schedule Meeting
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
              <User className="h-3 w-3" />
              Name
            </label>
            <p className="text-base font-medium text-slate-900 mt-1">{lead.name || 'N/A'}</p>
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Phone
            </label>
            <p className="text-base font-medium text-slate-900 mt-1">
              {lead.phone ? (
                <a href={`tel:${lead.phone}`} className="text-blue-600 hover:text-blue-800">
                  {lead.phone}
                </a>
              ) : 'N/A'}
            </p>
          </div>

          {/* Age */}
          <div>
            <label className="text-sm font-medium text-slate-500">Age</label>
            <p className="text-base font-medium text-slate-900 mt-1">{lead.age || 'N/A'}</p>
          </div>

          {/* University */}
          <div>
            <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              University
            </label>
            <p className="text-base font-medium text-slate-900 mt-1">{lead.university || 'N/A'}</p>
          </div>

          {/* Education Course */}
          <div>
            <label className="text-sm font-medium text-slate-500">Education Course</label>
            <p className="text-base font-medium text-slate-900 mt-1">{lead.education_course || 'N/A'}</p>
          </div>

          {/* Specialty */}
          <div>
            <label className="text-sm font-medium text-slate-500">Specialty</label>
            <p className="text-base font-medium text-slate-900 mt-1">{lead.specialty || 'N/A'}</p>
          </div>
        </div>

        {/* Meeting Info */}
        {lead.meeting_start && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Meeting Scheduled
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Date & Time</label>
                <p className="text-base font-medium text-slate-900 mt-1">
                  {format(new Date(lead.meeting_start), 'PPP p')}
                </p>
              </div>
              {lead.meeting_end && (
                <div>
                  <label className="text-sm font-medium text-slate-500">End Time</label>
                  <p className="text-base font-medium text-slate-900 mt-1">
                    {format(new Date(lead.meeting_end), 'p')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assigned To */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <label className="text-sm font-medium text-slate-500">Assigned To</label>
          <p className="text-base font-medium text-slate-900 mt-1">
            {lead.assigned_employee?.name || lead.assigned_employee?.username || 'Unassigned'}
          </p>
        </div>

        {/* Source */}
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-500">Source</label>
          <p className="text-base font-medium text-slate-900 mt-1 capitalize">{lead.source}</p>
        </div>
      </Card>

      {/* Current Situation Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Current Situation
        </h3>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-500">Current Activity</label>
            <p className="text-base text-slate-900 mt-1">{lead.current_activity || 'N/A'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-500">Current Job</label>
            <p className="text-base text-slate-900 mt-1">{lead.current_job || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                Monthly Income
              </label>
              <p className="text-base font-medium text-slate-900 mt-1">
                {lead.monthly_income
                  ? `${lead.monthly_income} ${lead.income_currency || ''}`.trim()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Goals Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goals & Motivation
        </h3>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-500">Main Goal</label>
            <p className="text-base text-slate-900 mt-1">{lead.main_goal || 'N/A'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-500">Main Obstacle</label>
            <p className="text-base text-slate-900 mt-1">{lead.main_obstacle || 'N/A'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-500">Why Now?</label>
            <p className="text-base text-slate-900 mt-1">{lead.why_now || 'N/A'}</p>
          </div>
        </div>
      </Card>

      {/* Previous Experience Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <History className="h-5 w-5" />
          Previous Experience
        </h3>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-500">Purchased Courses</label>
            <p className="text-base text-slate-900 mt-1">{lead.purchased_courses || 'N/A'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-500">Liked & Missing</label>
            <p className="text-base text-slate-900 mt-1">{lead.liked_and_missing || 'N/A'}</p>
          </div>
        </div>
      </Card>

      {/* Readiness Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Readiness
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-500">Ready to Start</label>
            <p className="text-base text-slate-900 mt-1">{lead.ready_to_start || 'N/A'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-500">Payment Decision Maker</label>
            <p className="text-base text-slate-900 mt-1">{lead.payment_decision_maker || 'N/A'}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-500">Development Budget</label>
            <p className="text-base text-slate-900 mt-1">{lead.development_budget || 'N/A'}</p>
          </div>
        </div>
      </Card>

      {/* Expected Result Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Expected Result
        </h3>

        <div>
          <label className="text-sm font-medium text-slate-500">Success Result</label>
          <p className="text-base text-slate-900 mt-1">{lead.success_result || 'N/A'}</p>
        </div>
      </Card>

      {/* Consultant Notes Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Consultant Notes</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingNotes(!isEditingNotes)}
          >
            {isEditingNotes ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </>
            )}
          </Button>
        </div>

        {isEditingNotes ? (
          <div className="space-y-4">
            <Textarea
              value={consultantNotes}
              onChange={(e) => setConsultantNotes(e.target.value)}
              placeholder="Add your notes here..."
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditingNotes(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => setIsEditingNotes(false)}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-base text-slate-700 whitespace-pre-wrap">
            {consultantNotes || 'No notes yet'}
          </p>
        )}
      </Card>

      {/* System Info */}
      <Card className="p-6 bg-slate-50">
        <h3 className="text-sm font-semibold text-slate-500 mb-4">System Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs font-medium text-slate-400">Created</label>
            <p className="text-slate-600">{format(new Date(lead.created_at), 'PPP p')}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-400">Updated</label>
            <p className="text-slate-600">{format(new Date(lead.updated_at), 'PPP p')}</p>
          </div>
        </div>
      </Card>

      {/* Schedule Modal */}
      <ScheduleConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        leadId={lead.id}
        leadName={lead.name || 'Client'}
      />
    </div>
  );
}
