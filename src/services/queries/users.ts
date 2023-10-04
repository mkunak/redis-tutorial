import { genId } from '$services/utils';
import { cacheKeyMapper } from '$services/keys';
import type { CreateUserAttrs, User } from '$services/types';
import { IDataSerializer, RetrievedDataValidator, client } from '$services/redis';


class UserDataSerializer implements IDataSerializer<CreateUserAttrs, User> {
  serialize(userData: CreateUserAttrs): Record<string, string> {
    return {
      username: userData.username,
      password: userData.password,
    };
  };

  deserialize(id: string, userData: Record<string, string>): User {
    return {
      id,
      username: userData.username,
      password: userData.password,
    };
  };
}


class HexDecConverter {
  toHex(decNumber: number) {
    return decNumber.toString(16);
  }

  toDec(hexString: string) {
    return parseInt(hexString, 16);
  }
}


export class UsersHandler {
  private retrievedDataValidator: RetrievedDataValidator;
  private userDataSerializer: UserDataSerializer;
  private hexDecConverter: HexDecConverter;


  constructor() {
    this.retrievedDataValidator = new RetrievedDataValidator();
    this.userDataSerializer = new UserDataSerializer();
    this.hexDecConverter = new HexDecConverter();
  }


  async createUser(attrs: CreateUserAttrs) {
    const isMember = await client.sIsMember(cacheKeyMapper.mapUsernames(), attrs.username);

    if (isMember) {
      throw new Error('Username is taken');
    }

    const userId = genId();

    await client.hSet(cacheKeyMapper.mapUser(userId), this.userDataSerializer.serialize(attrs));
    await client.sAdd(cacheKeyMapper.mapUsernames(), attrs.username);
    await client.zAdd(cacheKeyMapper.mapUsernamesItems(), {
      value: attrs.username,
      score: this.hexDecConverter.toDec(userId), // convert hexadecimal userId into 10-based decimal format
    });

    return userId;
  };


  async getUserById(userId: string) {
    const userData = await client.hGetAll(cacheKeyMapper.mapUser(userId));

    return this.retrievedDataValidator.isValid(userData)
    ? this.userDataSerializer.deserialize(userId, userData)
    : null;
  };


  async getUserByUsername(username: string) {
    const idDec = await client.zScore(cacheKeyMapper.mapUsernamesItems(), username);

    if (!idDec) {
      throw new Error('User does not exist');
    }

    const id = this.hexDecConverter.toHex(idDec);

    const user = await client.hGetAll(cacheKeyMapper.mapUser(id));

    return this.userDataSerializer.deserialize(id, user);
  };
}
