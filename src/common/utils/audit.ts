import { query } from '../../config/db';

export async function recordAudit(action: string, actorId: number | null, targetType?: string, targetId?: number, payload?: any) {
  await query(
    'INSERT INTO audit_logs (actor_id, action, target_type, target_id, payload_json) VALUES (:actor,:action,:type,:target,:payload)',
    {
      actor: actorId,
      action,
      type: targetType,
      target: targetId,
      payload: payload ? JSON.stringify(payload) : null
    }
  );
}
