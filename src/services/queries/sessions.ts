import type { CreateSessionDto, Session } from '$services/types';
import { IDataSerializer, client, RetrievedDataValidator } from '$services/redis';
import { cacheKeyMapper } from '$services/keys';


const retrievedDataValidator = new RetrievedDataValidator();


class SessionDataSerializer implements IDataSerializer<CreateSessionDto, Session> {
  serialize(userData: CreateSessionDto) {
    return {
      userId: userData.userId,
      username: userData.username,
    };
  };

  deserialize(sessionId: string, sessionData: Record<string, string>): Session {
    return {
      id: sessionId,
      userId: sessionData.userId,
      username: sessionData.username,
    };
  };
}

const sessionDataSerializer = new SessionDataSerializer();


export const saveSession = async (session: Session) => {
  const saved = await client.hSet(
    cacheKeyMapper.mapSession(session.id),
    sessionDataSerializer.serialize(session),
  );

  console.log('>>> saveSession > saved:', saved);

  return saved;
};


export const getSession = async (sessionId: string) => {
  const sessionData = await client.hGetAll(cacheKeyMapper.mapSession(sessionId));

  console.log('>>> getSession > sessionData:', sessionData);

  return retrievedDataValidator.isValid(sessionData)
    ? sessionDataSerializer.deserialize(sessionId, sessionData)
    : null;
};
