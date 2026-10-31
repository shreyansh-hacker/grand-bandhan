import { DataStore } from '../store';
import { WeddingPackageType, TaskPriority, TaskStatus } from '@grand-bandhan/shared';

interface TaskTemplate {
  title: string;
  category: string;
  description: string;
  leadTimeDaysBeforeWedding: number;
  priority: TaskPriority;
}

const FULL_SERVICE_TASK_TEMPLATES: TaskTemplate[] = [
  // 1. Initial Strategy & Theme
  {
    title: 'Initial Concept & Moodboard Finalization',
    category: 'Wedding Design',
    description: 'Establish colour palettes, royal aesthetic themes, and architectural mood boards for each function.',
    leadTimeDaysBeforeWedding: 120,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Primary Heritage Venue Inspection & Booking',
    category: 'Venue Arrangements',
    description: 'Site visit for palace/resort banquets, power load assessments, guest capacity verification, and contract signing.',
    leadTimeDaysBeforeWedding: 110,
    priority: TaskPriority.URGENT,
  },
  {
    title: 'Budget Allocation & Financial Blueprint',
    category: 'Financial Planning',
    description: 'Disburse department-level budgets across catering, decor, entertainment, and production with contingency margins.',
    leadTimeDaysBeforeWedding: 105,
    priority: TaskPriority.HIGH,
  },
  // 2. Vendor Selection & Comparison
  {
    title: 'Three Caterers Quotation Comparison & Food Tasting',
    category: 'Catering',
    description: 'Float RFP for 400 guests, compare per-plate pricing, dessert counters, live stations, and conduct couple menu tasting.',
    leadTimeDaysBeforeWedding: 90,
    priority: TaskPriority.URGENT,
  },
  {
    title: 'Catering Vendor Selection & Contract Lock',
    category: 'Catering',
    description: 'Review couple selection, finalize extra-plate rates, minimum guarantee, and sign catering contract.',
    leadTimeDaysBeforeWedding: 80,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Decor & Floral Production RFP & Vendor Comparison',
    category: 'Decoration',
    description: 'Source 3 decorator bids for Mandap, Sangeet stage, Royal Entrance arches, and floral installations.',
    leadTimeDaysBeforeWedding: 75,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Wedding Photographer & Cinematographer Lock',
    category: 'Photography',
    description: 'Review portfolio, drone permissions, teaser timelines, candid crew count, and sign contract.',
    leadTimeDaysBeforeWedding: 70,
    priority: TaskPriority.MEDIUM,
  },
  {
    title: 'Sound, Stage & DJ Artists Lineup Finalization',
    category: 'Vendor Coordination',
    description: 'Book celebrity/club DJ, acoustic system, LED wall backdrop, and light show technicians.',
    leadTimeDaysBeforeWedding: 60,
    priority: TaskPriority.HIGH,
  },
  // 3. Guest Experience & Hospitality
  {
    title: 'Guest List Consolidation & Side-wise Categorization',
    category: 'Guest Arrangements',
    description: 'Tag Bride-side and Groom-side VIPs, dietary requirements, and room allocation grids.',
    leadTimeDaysBeforeWedding: 55,
    priority: TaskPriority.MEDIUM,
  },
  {
    title: 'Digital Invitations & RSVP Portal Dispatch',
    category: 'Guest Arrangements',
    description: 'Send custom animated digital invites and track real-time RSVP counts for catering confirmation.',
    leadTimeDaysBeforeWedding: 50,
    priority: TaskPriority.MEDIUM,
  },
  {
    title: 'Airport & Station Luxury Fleet Transportation Setup',
    category: 'Guest Arrangements',
    description: 'Coordinate chauffeur-driven vehicles, luggage vans, and VIP escort schedules.',
    leadTimeDaysBeforeWedding: 45,
    priority: TaskPriority.MEDIUM,
  },
  // 4. Ceremony-Specific Preparations
  {
    title: 'Mehendi Artists Booking & Henna Corner Design',
    category: 'Mehendi',
    description: 'Lock master mehendi artist for bride, 10 assistants for guests, and Bohemian-chic seating setup.',
    leadTimeDaysBeforeWedding: 40,
    priority: TaskPriority.MEDIUM,
  },
  {
    title: 'Sangeet Choreography & Audio Track Editing',
    category: 'Sangeet',
    description: 'Finalize family performance sequences, professional choreography rehearsals, and mastered sound cuts.',
    leadTimeDaysBeforeWedding: 35,
    priority: TaskPriority.MEDIUM,
  },
  {
    title: 'Bridal & Groom Couture Trials & Jewelry Lockers',
    category: 'Wedding Design',
    description: 'Final fittings for bridal lehenga, sherwani, safa matching, and secure hotel locker allocations.',
    leadTimeDaysBeforeWedding: 30,
    priority: TaskPriority.MEDIUM,
  },
  {
    title: 'Makeup Artist (MUA) Trials & Scheduling',
    category: 'Vendor Coordination',
    description: 'Bridal HD makeup trial, hair styling selection, and schedule call times for all functions.',
    leadTimeDaysBeforeWedding: 25,
    priority: TaskPriority.MEDIUM,
  },
  // 5. Approvals, Permits & Pre-Wedding Execution
  {
    title: 'Govt & Civic Event Permits (Sound, PPL, Police)',
    category: 'Vendor Coordination',
    description: 'Acquire loudspeaker permission, fire NOC, liquor license, and copyright performance permits.',
    leadTimeDaysBeforeWedding: 20,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Wedding Pandit / Ritual Priest Briefing',
    category: 'Wedding Rituals',
    description: 'Align sacred Muhurat timings, pooja samagri checklist, and custom family rituals.',
    leadTimeDaysBeforeWedding: 15,
    priority: TaskPriority.MEDIUM,
  },
  {
    title: 'Baraat Procession & Vintage Car / Mare Booking',
    category: 'Wedding Rituals',
    description: 'Confirm vintage convertible / royal mare, mobile DJ truck, Dhol player troupe, and safety team.',
    leadTimeDaysBeforeWedding: 14,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Garland (Varmala) Concept & Pyro Effects Setup',
    category: 'Wedding Rituals',
    description: 'Stage hydraulic lift or revolving platform check, cold pyro safety distance check, and rose petal shower canons.',
    leadTimeDaysBeforeWedding: 10,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Final Guest Count & Plate Guarantee Confirmation',
    category: 'Catering',
    description: 'Send locked guest count to caterer to calculate base commitment and overage thresholds.',
    leadTimeDaysBeforeWedding: 7,
    priority: TaskPriority.URGENT,
  },
  // 6. Day-Of Coordination & Closing
  {
    title: 'Full Production Technical Rehearsal',
    category: 'Rehearsal',
    description: 'Walkthrough with sound engineers, anchor, lighting crew, and coordinator team.',
    leadTimeDaysBeforeWedding: 3,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Day-of Staff Radios & Coordinator Role Briefing',
    category: 'Wedding-day execution',
    description: 'Assign shadow coordinators to Bride, Groom, family VIPs, and setup command center.',
    leadTimeDaysBeforeWedding: 1,
    priority: TaskPriority.URGENT,
  },
  {
    title: 'Morning Vendor Arrival & Setup Verification',
    category: 'Wedding-day execution',
    description: 'Track entry gate arrivals of florist, sound, decor, and catering prep crew.',
    leadTimeDaysBeforeWedding: 0,
    priority: TaskPriority.URGENT,
  },
  {
    title: 'Varmala & Sacred Pheras Ritual Coordination',
    category: 'Wedding-day execution',
    description: 'Execute garland exchange cue sheet, havana kund management, and wedding vows documentation.',
    leadTimeDaysBeforeWedding: 0,
    priority: TaskPriority.URGENT,
  },
  {
    title: 'Reception Dinner & VIP Seating Hostesses Briefing',
    category: 'Reception',
    description: 'Ensure banquet doors open at 8:00 PM, VIP tables served, and live counters fully stocked.',
    leadTimeDaysBeforeWedding: 0,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Post-Event Inventory, Pack-down & Plate Count Sign-off',
    category: 'Wedding-day execution',
    description: 'Audit caterer plate count with hotel supervisor, verify rented decor returns, and log unexpected expenses.',
    leadTimeDaysBeforeWedding: -1,
    priority: TaskPriority.HIGH,
  },
];

const PARTIAL_DAY_OF_TASK_TEMPLATES: TaskTemplate[] = [
  {
    title: 'Client Intake & Existing Vendor Contract Review',
    category: 'Vendor Coordination',
    description: 'Collect all executed vendor agreements, contact points, and scope deliverables from the couple.',
    leadTimeDaysBeforeWedding: 30,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Master Day-of Master Timeline Construction',
    category: 'Event-day schedule',
    description: 'Synthesize Baraat, Varmala, Pheras, and Reception into a minute-by-minute execution run-sheet.',
    leadTimeDaysBeforeWedding: 21,
    priority: TaskPriority.URGENT,
  },
  {
    title: 'All-Vendor Alignment Conference Call',
    category: 'Vendor Coordination',
    description: 'Brief caterer, decorator, DJ, and photographer on arrival windows, loading docks, and point of contacts.',
    leadTimeDaysBeforeWedding: 14,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Venue Walkthrough & Floor Plan Sign-off',
    category: 'Venue Arrangements',
    description: 'Verify emergency exits, green rooms, buffet layout, and sound decibel limits.',
    leadTimeDaysBeforeWedding: 10,
    priority: TaskPriority.MEDIUM,
  },
  {
    title: 'Family & Bridal Party Coordination Briefing',
    category: 'Family coordination',
    description: 'Designate key family members for cash tips, jewelry custody, and ritual samagri handover.',
    leadTimeDaysBeforeWedding: 7,
    priority: TaskPriority.MEDIUM,
  },
  {
    title: 'Vendor Contact Directory & Escalation Tree Broadcast',
    category: 'Vendor Coordination',
    description: 'Publish digital contact sheet with on-ground lead numbers to all teams.',
    leadTimeDaysBeforeWedding: 3,
    priority: TaskPriority.MEDIUM,
  },
  {
    title: 'Groom & Bride Procession Logistics Check',
    category: 'Event-day schedule',
    description: 'Verify route for Baraat, music generator truck, and bridal entry buggy/palanquin.',
    leadTimeDaysBeforeWedding: 2,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Day-of Vendor Arrival Gate Management',
    category: 'Day-of execution',
    description: 'Check in each vendor at gate, log arrival timestamps, and confirm setup readiness.',
    leadTimeDaysBeforeWedding: 0,
    priority: TaskPriority.URGENT,
  },
  {
    title: 'Stage & Mandap Pooja Flow Management',
    category: 'Day-of execution',
    description: 'Guide pandit, couple, and parents through rituals on schedule.',
    leadTimeDaysBeforeWedding: 0,
    priority: TaskPriority.URGENT,
  },
  {
    title: 'Dining Room Service & Guest Flow Supervision',
    category: 'Day-of execution',
    description: 'Inspect food temperature, water stations, and VIP table service.',
    leadTimeDaysBeforeWedding: 0,
    priority: TaskPriority.HIGH,
  },
  {
    title: 'Event Closure & Vendor Sign-off Protocol',
    category: 'Event closure',
    description: 'Verify venue handover, obtain final signatures on service verifications, and clear out.',
    leadTimeDaysBeforeWedding: -1,
    priority: TaskPriority.HIGH,
  },
];

export function generateInstantWeddingPlan(
  weddingId: string,
  weddingDateStr: string | Date,
  packageType: WeddingPackageType
): any[] {
  const weddingDate = new Date(weddingDateStr);
  const templates =
    packageType === WeddingPackageType.PARTIAL_DAY_OF
      ? PARTIAL_DAY_OF_TASK_TEMPLATES
      : FULL_SERVICE_TASK_TEMPLATES;

  // Check if tasks already exist to avoid duplicate generation
  const existing = DataStore.tasks.listByWedding(weddingId);
  if (existing.length > 0) {
    // If regenerating, clear previous auto-generated ones
    DataStore.tasks.deleteByWedding(weddingId);
  }

  const tasksToCreate = templates.map((tmpl) => {
    // Calculate dynamic deadline based on wedding date and lead time
    const deadlineTime = weddingDate.getTime() - tmpl.leadTimeDaysBeforeWedding * 24 * 60 * 60 * 1000;
    const deadline = new Date(deadlineTime).toISOString();

    return {
      weddingId,
      title: tmpl.title,
      category: tmpl.category,
      description: tmpl.description,
      deadline,
      leadTimeDays: tmpl.leadTimeDaysBeforeWedding,
      priority: tmpl.priority,
      status: TaskStatus.TO_PLAN,
      isAutoGenerated: true,
    };
  });

  return DataStore.tasks.createMany(tasksToCreate);
}
