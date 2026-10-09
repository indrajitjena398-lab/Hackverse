import { SkillNode, SkillEdge, SkillDistanceCalculation, PrerequisiteChainStep, MasteryLevel } from '../types/skills';

export class DLDMEngine {
  private skillsMap: Map<string, SkillNode>;
  private edges: SkillEdge[];

  constructor(skills: SkillNode[], edges: SkillEdge[]) {
    this.skillsMap = new Map(skills.map(s => [s.id, s]));
    this.edges = edges;
  }

  public getSkill(id: string): SkillNode | undefined {
    return this.skillsMap.get(id);
  }

  public getAllSkills(): SkillNode[] {
    return Array.from(this.skillsMap.values());
  }

  /**
   * Recursively traverses backward to collect all prerequisite skill IDs in topological dependency order.
   */
  public getPrerequisiteChain(targetSkillId: string): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const traverse = (skillId: string) => {
      const skill = this.skillsMap.get(skillId);
      if (!skill) return;

      for (const prereqId of skill.prerequisiteIds) {
        if (!visited.has(prereqId)) {
          visited.add(prereqId);
          traverse(prereqId);
          order.push(prereqId);
        }
      }
    };

    traverse(targetSkillId);
    return order;
  }

  /**
   * Calculates the skill distance and builds a sequential learning pathway
   * based on the candidate's current mastery levels.
   */
  public calculateSkillDistance(
    targetSkillId: string,
    candidateMasteryMap: Map<string, MasteryLevel>
  ): SkillDistanceCalculation {
    const targetSkill = this.skillsMap.get(targetSkillId);
    if (!targetSkill) {
      throw new Error(`Target skill ${targetSkillId} does not exist in ontology DAG.`);
    }

    const prereqIds = this.getPrerequisiteChain(targetSkillId);
    const allChainSkillIds = [...prereqIds, targetSkillId];

    let completedPrereqs = 0;
    const pathwaySteps: PrerequisiteChainStep[] = [];

    allChainSkillIds.forEach((skillId, index) => {
      const skill = this.skillsMap.get(skillId);
      if (!skill) return;

      const currentMastery = candidateMasteryMap.get(skillId) || 'locked';
      const isMastered = currentMastery === 'mastered' || currentMastery === 'proficient';

      if (isMastered && skillId !== targetSkillId) {
        completedPrereqs++;
      }

      pathwaySteps.push({
        stepNumber: index + 1,
        skillId: skill.id,
        name: skill.name,
        status: currentMastery,
        isCompleted: isMastered,
        estimatedHours: skill.estimatedHoursToMaster,
      });
    });

    const totalPrereqs = prereqIds.length;
    const readinessPercentage = totalPrereqs === 0 
      ? (candidateMasteryMap.get(targetSkillId) === 'mastered' ? 100 : 80)
      : Math.round((completedPrereqs / totalPrereqs) * 100);

    // Skill distance = remaining unmastered prerequisites + (is target mastered ? 0 : 1)
    const targetMastered = candidateMasteryMap.get(targetSkillId) === 'mastered';
    const unmasteredPrereqs = totalPrereqs - completedPrereqs;
    const skillDistance = unmasteredPrereqs + (targetMastered ? 0 : 1);

    return {
      targetSkillId: targetSkill.id,
      targetSkillName: targetSkill.name,
      skillDistance,
      readinessPercentage,
      completedPrerequisites: completedPrereqs,
      totalPrerequisites: totalPrereqs,
      sequentialPathway: pathwaySteps,
    };
  }

  /**
   * Determine the unlockable status of all skills given the current mastery state
   */
  public evaluateAllSkillStatuses(candidateMasteryMap: Map<string, MasteryLevel>): Map<string, MasteryLevel> {
    const updatedStatuses = new Map<string, MasteryLevel>();

    this.skillsMap.forEach(skill => {
      const existing = candidateMasteryMap.get(skill.id);
      if (existing === 'mastered' || existing === 'proficient') {
        updatedStatuses.set(skill.id, existing);
        return;
      }

      // Check if all prerequisites are fulfilled
      if (skill.prerequisiteIds.length === 0) {
        updatedStatuses.set(skill.id, existing || 'in_progress');
      } else {
        const allPrereqsMet = skill.prerequisiteIds.every(prereqId => {
          const prereqStatus = candidateMasteryMap.get(prereqId);
          return prereqStatus === 'mastered' || prereqStatus === 'proficient';
        });

        if (allPrereqsMet) {
          updatedStatuses.set(skill.id, existing === 'in_progress' ? 'in_progress' : 'in_progress');
        } else {
          updatedStatuses.set(skill.id, 'prerequisite_needed');
        }
      }
    });

    return updatedStatuses;
  }
}
