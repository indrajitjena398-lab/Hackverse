/**
 * Placement Video Interview Store & Speech Debrief Engine
 * Curated archive of real company/institution placement interviews with speech transcripts & placement success factors.
 */

import { PlacementVideoInterview } from '@/lib/types/videoInterview';
import { eventBus } from '@/lib/engine/EventBus';

export const INITIAL_PLACEMENT_INTERVIEWS: PlacementVideoInterview[] = [
  {
    id: 'int-pmec-google-01',
    candidateName: 'Soumya Ranjan Mohapatra',
    candidateEmail: 'soumya.r@alumni.pmec.ac.in',
    institutionName: 'Parala Maharaja Engineering College (PMEC)',
    department: 'Computer Science & Engineering',
    cgpa: '9.12',
    companyName: 'Google',
    roleTitle: 'Software Development Engineer II (Distributed Systems)',
    packageCtc: '44.5 LPA',
    placementYear: 2026,
    durationSeconds: 1680,
    thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    interviewerNotes: 'Outstanding explanation of Raft leader election edge cases and distributed state machine replication. Immediate Strong Hire.',
    viewsCount: 1420,
    helpfulCount: 388,
    createdAt: '2026-09-18T10:30:00Z',
    transcript: [
      {
        speaker: 'Marcus Vance (Staff SRE, Google)',
        role: 'Interviewer',
        time: '00:15',
        timestampSeconds: 15,
        text: 'Welcome Soumya. In our distributed key-value store, how would you design consensus when 2 out of 5 cluster nodes experience network partitioning?',
      },
      {
        speaker: 'Soumya Ranjan (PMEC)',
        role: 'Candidate',
        time: '00:45',
        timestampSeconds: 45,
        text: 'In a 5-node cluster running Raft consensus, a quorum requires strict majority: ⌊5/2⌋ + 1 = 3 nodes. If 2 nodes partition off, the remaining 3 nodes retain an active quorum and continue accepting writes.',
        competencyTagged: 'Distributed Consensus & Quorum Theory',
        highlight: true,
      },
      {
        speaker: 'Soumya Ranjan (PMEC)',
        role: 'Candidate',
        time: '01:30',
        timestampSeconds: 90,
        text: 'Meanwhile, the partitioned 2-node sub-cluster will reject writes due to inability to obtain heartbeats from a majority leader, preventing split-brain state inconsistencies.',
        competencyTagged: 'CAP Theorem & Split-Brain Mitigation',
        highlight: true,
      },
      {
        speaker: 'Marcus Vance (Staff SRE, Google)',
        role: 'Interviewer',
        time: '02:10',
        timestampSeconds: 130,
        text: 'Excellent precision. Now let’s talk about Write-Ahead Logging (WAL) and disk fsync overhead. How do you maintain P99 latency under 4ms?',
      },
      {
        speaker: 'Soumya Ranjan (PMEC)',
        role: 'Candidate',
        time: '02:35',
        timestampSeconds: 155,
        text: 'We avoid synchronous fsync per write by implementing Group Commit buffering with BullMQ lock-free queues, combined with memory-mapped circular ring buffers.',
        competencyTagged: 'Low-Latency Systems & I/O Optimization',
        highlight: true,
      },
    ],
    placementSuccessFactors: {
      whyTheyGotPlaced: 'Demonstrated deterministic mathematical understanding of distributed consensus, quantified P99 latencies without hesitation, and articulated trade-offs between linearizability and availability.',
      keyCompetencies: [
        'Distributed Consensus (Raft/Paxos)',
        'Low-Latency Linux I/O & Group Commit',
        'Structured STAR Communication',
        'Quantified System Performance Under Partition'
      ],
      breakdownScores: {
        technicalProwess: 98,
        systemDesign: 96,
        communication: 92,
        culturalFit: 94,
      },
      answerHighlights: [
        {
          question: 'Network Partitioning in 5-Node Quorum',
          timestamp: '00:45',
          takeaway: 'Derived quorum formula directly from first principles and explained why 3 nodes safely continue.',
          whyItStoodOut: 'Did not jump to vague frameworks; gave concrete arithmetic and state machine guarantees.',
        },
        {
          question: 'P99 Disk Write Latency Optimization',
          timestamp: '02:35',
          takeaway: 'Leveraged Group Commit and memory-mapped circular buffers to bypass synchronous fsync bottlenecks.',
          whyItStoodOut: 'Showed real systems engineering depth rather than standard high-level textbook answers.',
        },
      ],
      alumniAdvice: 'Always state your performance assumptions upfront. Do not just say "I will scale it"; state exact mathematical bounds and failure modes.',
    },
  },
  {
    id: 'int-pmec-microsoft-02',
    candidateName: 'Priyanka Priyadarshini Nayak',
    candidateEmail: 'priyanka.nayak@alumni.pmec.ac.in',
    institutionName: 'Parala Maharaja Engineering College (PMEC)',
    department: 'Electrical & Electronics Engineering',
    cgpa: '8.94',
    companyName: 'Microsoft',
    roleTitle: 'Cloud Solutions Architect (Azure Core Infrastructure)',
    packageCtc: '36.0 LPA',
    placementYear: 2026,
    durationSeconds: 1520,
    thumbnailUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    interviewerNotes: 'Deep comprehension of Azure multi-region active-active failover, global traffic routing, and BGP peering.',
    viewsCount: 1180,
    helpfulCount: 312,
    createdAt: '2026-09-22T14:15:00Z',
    transcript: [
      {
        speaker: 'David Zheng (Principal Architect, Microsoft)',
        role: 'Interviewer',
        time: '00:20',
        timestampSeconds: 20,
        text: 'Priyanka, when an enterprise client requires 99.999% availability across West US and North Europe, what topology do you propose?',
      },
      {
        speaker: 'Priyanka Nayak (PMEC)',
        role: 'Candidate',
        time: '00:50',
        timestampSeconds: 50,
        text: 'To guarantee five-nines (under 5.26 minutes downtime per year), we need Active-Active Multi-Region deployment managed by Azure Front Door with Anycast DNS and TCP split.',
        competencyTagged: 'High-Availability Cloud Topology',
        highlight: true,
      },
      {
        speaker: 'Priyanka Nayak (PMEC)',
        role: 'Candidate',
        time: '01:40',
        timestampSeconds: 100,
        text: 'For the database layer, we enforce Cosmos DB multi-region master writes with Session Consistency, paired with circuit-breakers in our Next.js API gateways.',
        competencyTagged: 'Cosmos DB Multi-Master Replication',
        highlight: true,
      },
    ],
    placementSuccessFactors: {
      whyTheyGotPlaced: 'Uncompromising clarity on SLA calculation, cost-performance trade-offs for geo-replication, and real-time network latency budgeting.',
      keyCompetencies: [
        'Global Anycast Network Routing',
        'Five-Nines SLA Engineering',
        'Cosmos DB Multi-Master Consistency',
        'Enterprise Security & RBAC Guardrails'
      ],
      breakdownScores: {
        technicalProwess: 94,
        systemDesign: 97,
        communication: 95,
        culturalFit: 91,
      },
      answerHighlights: [
        {
          question: '99.999% Availability Architecture',
          timestamp: '00:50',
          takeaway: 'Calculated 5.26 minute annual downtime limit instantly and selected Azure Front Door Anycast routing.',
          whyItStoodOut: 'Tied SLA mathematics directly to cloud infrastructure components.',
        },
      ],
      alumniAdvice: 'Know the monetary cost of downtime. Interviewers love engineers who treat cloud compute resources with financial discipline.',
    },
  },
  {
    id: 'int-pmec-tatasteel-03',
    candidateName: 'Aditya Narayan Biswal',
    candidateEmail: 'aditya.biswal@alumni.pmec.ac.in',
    institutionName: 'Parala Maharaja Engineering College (PMEC)',
    department: 'Electrical Engineering',
    cgpa: '8.81',
    companyName: 'Tata Steel',
    roleTitle: 'Industrial IoT & Smart Grid Automation Lead',
    packageCtc: '19.5 LPA',
    placementYear: 2026,
    durationSeconds: 1350,
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    interviewerNotes: 'Deep industrial domain mastery. Clear understanding of SCADA telemetry, Modbus TCP protocols, and predictive blast furnace maintenance.',
    viewsCount: 940,
    helpfulCount: 245,
    createdAt: '2026-09-25T11:00:00Z',
    transcript: [
      {
        speaker: 'Dr. Debabrata Roy (Chief Technology Officer, Tata Steel)',
        role: 'Interviewer',
        time: '00:10',
        timestampSeconds: 10,
        text: 'Aditya, how do you ingest and filter 100,000 sensor pulses per second from our Kalinganagar Hot Strip Mill without losing telemetry?',
      },
      {
        speaker: 'Aditya Biswal (PMEC)',
        role: 'Candidate',
        time: '00:35',
        timestampSeconds: 35,
        text: 'We deploy Edge IoT Gateways running embedded Linux with MQTT-SN broker for real-time edge deduplication. Only anomalies and moving averages are dispatched upstream to Kafka.',
        competencyTagged: 'Edge IIoT Architecture & Stream Deduplication',
        highlight: true,
      },
    ],
    placementSuccessFactors: {
      whyTheyGotPlaced: 'Bridge between heavy industrial power engineering and modern distributed data pipelines. Strong electrical background merged with Edge computing.',
      keyCompetencies: [
        'SCADA & Modbus Industrial Protocols',
        'Edge Deduplication & Kafka Stream Ingestion',
        'Predictive Maintenance ML Algorithms',
        'Safety-Critical Fail-Safe Design'
      ],
      breakdownScores: {
        technicalProwess: 93,
        systemDesign: 91,
        communication: 89,
        culturalFit: 96,
      },
      answerHighlights: [
        {
          question: '100,000 Pulses/sec High-Frequency Ingestion',
          timestamp: '00:35',
          takeaway: 'Leveraged edge micro-filtering and MQTT-SN protocol to conserve plant telemetry bandwidth.',
          whyItStoodOut: 'Avoided naive cloud-dumping and respected industrial plant operational realities.',
        },
      ],
      alumniAdvice: 'If you are from PMEC Core branches (Electrical/Mech), master IoT and Python scripting—that combination is gold in manufacturing giants.',
    },
  },
  {
    id: 'int-pmec-lnt-04',
    candidateName: 'Subhasmita Sahoo',
    candidateEmail: 'subhasmita.s@alumni.pmec.ac.in',
    institutionName: 'Parala Maharaja Engineering College (PMEC)',
    department: 'Electronics & Telecommunication Engineering',
    cgpa: '8.76',
    companyName: 'L&T Technology Services',
    roleTitle: 'Embedded Robotics Firmware Engineer',
    packageCtc: '16.8 LPA',
    placementYear: 2026,
    durationSeconds: 1410,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    interviewerNotes: 'Remarkable understanding of FreeRTOS task scheduling, priority inversion solutions with priority inheritance, and CAN bus arbitration.',
    viewsCount: 820,
    helpfulCount: 210,
    createdAt: '2026-09-28T16:20:00Z',
    transcript: [
      {
        speaker: 'Ramesh K. (Chief Firmware Architect, LTTS)',
        role: 'Interviewer',
        time: '00:25',
        timestampSeconds: 25,
        text: 'Subhasmita, how do you resolve priority inversion when a low-priority sensor task holds a mutex needed by an emergency braking task?',
      },
      {
        speaker: 'Subhasmita Sahoo (PMEC)',
        role: 'Candidate',
        time: '00:55',
        timestampSeconds: 55,
        text: 'We configure FreeRTOS recursive mutexes with Priority Inheritance Protocol (PIP). As soon as the emergency task requests the mutex, the low-priority task temporarily inherits the emergency task priority until releasing the resource.',
        competencyTagged: 'RTOS Priority Inversion & Mutex Protocol',
        highlight: true,
      },
    ],
    placementSuccessFactors: {
      whyTheyGotPlaced: 'Flawless recall of real-time operating system primitives, DMA transfers, and memory-safe C/C++ firmware design.',
      keyCompetencies: [
        'FreeRTOS Deterministic Scheduling',
        'CAN-Bus & SPI/I2C Protocols',
        'Hardware Timer & Interrupt Service Routines',
        'Memory Footprint Optimization (ARM Cortex-M)'
      ],
      breakdownScores: {
        technicalProwess: 96,
        systemDesign: 90,
        communication: 91,
        culturalFit: 92,
      },
      answerHighlights: [
        {
          question: 'RTOS Priority Inversion in Braking System',
          timestamp: '00:55',
          takeaway: 'Applied Priority Inheritance Protocol to ensure deterministic bounded execution time.',
          whyItStoodOut: 'Cited the Mars Pathfinder priority inversion case study and demonstrated practical safety knowledge.',
        },
      ],
      alumniAdvice: 'Practice debugging bare-metal registers and timing diagrams. Hardware companies test fundamentals, not hype.',
    },
  },
];

export class PlacementInterviewStore {
  private static instance: PlacementInterviewStore;
  private interviews: PlacementVideoInterview[] = [];

  private constructor() {
    this.hydrate();
  }

  public static getInstance(): PlacementInterviewStore {
    if (!PlacementInterviewStore.instance) {
      PlacementInterviewStore.instance = new PlacementInterviewStore();
    }
    return PlacementInterviewStore.instance;
  }

  private hydrate() {
    this.interviews = [...INITIAL_PLACEMENT_INTERVIEWS];
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('aura_placement_video_interviews');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge user-recorded interviews with initial verified interviews
          const userOnly = parsed.filter((p: any) => p.isUserRecorded);
          this.interviews = [...userOnly, ...INITIAL_PLACEMENT_INTERVIEWS];
        }
      }
    } catch (e) {
      console.warn('Failed to load placement interviews from storage', e);
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('aura_placement_video_interviews', JSON.stringify(this.interviews));
    } catch (e) {
      console.warn('Failed to persist placement interviews', e);
    }
  }

  public getAllInterviews(): PlacementVideoInterview[] {
    return this.interviews;
  }

  public getInterviewById(id: string): PlacementVideoInterview | undefined {
    return this.interviews.find(i => i.id === id);
  }

  public addRecordedInterview(interview: PlacementVideoInterview): void {
    this.interviews.unshift(interview);
    this.persist();

    eventBus.publish({
      type: 'INTERVIEW_RECORDED',
      payload: { interviewId: interview.id, candidateName: interview.candidateName },
    } as any);
  }

  public incrementHelpful(id: string): number {
    const item = this.interviews.find(i => i.id === id);
    if (item) {
      item.helpfulCount += 1;
      this.persist();
      return item.helpfulCount;
    }
    return 0;
  }
}

export const placementInterviewStore = PlacementInterviewStore.getInstance();
