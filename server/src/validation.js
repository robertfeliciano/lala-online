import {ObjectId} from "mongodb";

export const checkId = (id) => {
  if (!id) throw 'Error: You must provide an id to search for';
  if (typeof id !== 'string') throw 'Error: id must be a string';
  id = id.trim();
  if (id.length === 0)
    throw 'Error: id cannot be an empty string or just spaces';
  if (!ObjectId.isValid(id)) throw 'Error: invalid object ID';
  return new ObjectId(id);
}