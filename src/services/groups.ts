import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  query, 
  where,
  onSnapshot,
  Timestamp,
  deleteDoc,
  Unsubscribe
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { auth } from '../config/firebase';
import { UserProfile, getUserProfile } from './users';

// Types
export interface Group {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Timestamp;
  members: GroupMember[];
  invites: string[]; // Array of user IDs who have been invited
}

export interface GroupMember {
  uid: string;
  role: GroupRole;
  joinedAt: Timestamp;
}

export enum GroupRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

/**
 * Creates a new family group
 * @param name - The name of the group
 * @returns The created group
 */
export const createGroup = async (name: string): Promise<Group> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    const groupData = {
      name,
      createdBy: currentUser.uid,
      createdAt: Timestamp.now(),
      members: [{
        uid: currentUser.uid,
        role: GroupRole.ADMIN,
        joinedAt: Timestamp.now()
      }],
      invites: []
    };
    
    const groupRef = await addDoc(collection(firestore, 'groups'), groupData);
    
    return {
      id: groupRef.id,
      ...groupData
    };
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

/**
 * Gets a group by ID
 * @param groupId - The ID of the group to get
 * @returns The group data or null if not found
 */
export const getGroupById = async (groupId: string): Promise<Group | null> => {
  try {
    const groupDoc = await getDoc(doc(firestore, 'groups', groupId));
    
    if (!groupDoc.exists()) return null;
    
    const groupData = groupDoc.data();
    
    return {
      id: groupDoc.id,
      ...groupData
    } as Group;
  } catch (error) {
    console.error('Error getting group:', error);
    throw error;
  }
};

/**
 * Gets all groups that the current user is a member of
 * @returns An array of groups
 */
export const getUserGroups = async (): Promise<Group[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    const groupsQuery = query(
      collection(firestore, 'groups'),
      where('members', 'array-contains', { uid: currentUser.uid })
    );
    
    const querySnapshot = await getDocs(groupsQuery);
    const groups: Group[] = [];
    
    querySnapshot.forEach((doc) => {
      groups.push({
        id: doc.id,
        ...doc.data()
      } as Group);
    });
    
    return groups;
  } catch (error) {
    console.error('Error getting user groups:', error);
    throw error;
  }
};

/**
 * Subscribes to a group's data
 * @param groupId - The ID of the group to subscribe to
 * @param callback - Function to call with group data
 * @returns A function to unsubscribe
 */
export const subscribeToGroup = (
  groupId: string,
  callback: (group: Group | null) => void
): Unsubscribe => {
  const groupRef = doc(firestore, 'groups', groupId);
  
  return onSnapshot(groupRef, (doc) => {
    if (!doc.exists()) {
      callback(null);
      return;
    }
    
    callback({
      id: doc.id,
      ...doc.data()
    } as Group);
  });
};

/**
 * Invites a user to a group
 * @param groupId - The ID of the group
 * @param phoneNumber - The phone number of the user to invite
 */
export const inviteToGroup = async (groupId: string, phoneNumber: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    // Get the group
    const group = await getGroupById(groupId);
    if (!group) throw new Error('Group not found');
    
    // Check if current user is an admin
    const isAdmin = group.members.some(
      (member) => member.uid === currentUser.uid && member.role === GroupRole.ADMIN
    );
    
    if (!isAdmin) throw new Error('Only admins can invite users');
    
    // Find user by phone number
    const usersQuery = query(
      collection(firestore, 'users'),
      where('phoneNumber', '==', phoneNumber)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.empty) {
      throw new Error('User not found with that phone number');
    }
    
    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    
    // Check if user is already a member
    const isMember = group.members.some((member) => member.uid === userId);
    
    if (isMember) {
      throw new Error('User is already a member of this group');
    }
    
    // Check if user is already invited
    const isInvited = group.invites.includes(userId);
    
    if (isInvited) {
      throw new Error('User is already invited to this group');
    }
    
    // Add user to invites
    await updateDoc(doc(firestore, 'groups', groupId), {
      invites: arrayUnion(userId)
    });
  } catch (error) {
    console.error('Error inviting to group:', error);
    throw error;
  }
};

/**
 * Accepts a group invitation
 * @param groupId - The ID of the group
 */
export const acceptGroupInvitation = async (groupId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    // Get the group
    const group = await getGroupById(groupId);
    if (!group) throw new Error('Group not found');
    
    // Check if user is invited
    const isInvited = group.invites.includes(currentUser.uid);
    
    if (!isInvited) {
      throw new Error('You are not invited to this group');
    }
    
    // Add user as member and remove from invites
    await updateDoc(doc(firestore, 'groups', groupId), {
      members: arrayUnion({
        uid: currentUser.uid,
        role: GroupRole.MEMBER,
        joinedAt: Timestamp.now()
      }),
      invites: arrayRemove(currentUser.uid)
    });
  } catch (error) {
    console.error('Error accepting group invitation:', error);
    throw error;
  }
};

/**
 * Leaves a group
 * @param groupId - The ID of the group
 */
export const leaveGroup = async (groupId: string): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    
    // Get the group
    const group = await getGroupById(groupId);
    if (!group) throw new Error('Group not found');
    
    // Find the member entry for the current user
    const memberEntry = group.members.find((member) => member.uid === currentUser.uid);
    
    if (!memberEntry) {
      throw new Error('You are not a member of this group');
    }
    
    // Check if user is the only admin
    const isOnlyAdmin = 
      memberEntry.role === GroupRole.ADMIN && 
      group.members.filter((m) => m.role === GroupRole.ADMIN).length === 1;
    
    if (isOnlyAdmin && group.members.length > 1) {
      throw new Error('You cannot leave the group as you are the only admin. Please assign another admin first.');
    }
    
    // If user is the only member, delete the group
    if (group.members.length === 1) {
      await deleteDoc(doc(firestore, 'groups', groupId));
      return;
    }
    
    // Remove user from members
    await updateDoc(doc(firestore, 'groups', groupId), {
      members: group.members.filter((member) => member.uid !== currentUser.uid)
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

/**
 * Gets all members of a group with their profiles
 * @param groupId - The ID of the group
 * @returns An array of user profiles with their group roles
 */
export const getGroupMembers = async (groupId: string): Promise<(UserProfile & { role: GroupRole })[]> => {
  try {
    // Get the group
    const group = await getGroupById(groupId);
    if (!group) throw new Error('Group not found');
    
    // Get each member's profile
    const memberProfiles = await Promise.all(
      group.members.map(async (member) => {
        const userDoc = await getDoc(doc(firestore, 'users', member.uid));
        
        if (!userDoc.exists()) {
          return null;
        }
        
        const userData = userDoc.data();
        
        return {
          uid: member.uid,
          phoneNumber: userData.phoneNumber,
          displayName: userData.displayName,
          status: userData.status,
          lastLocation: userData.lastLocation,
          lastStatusUpdate: userData.lastStatusUpdate,
          isAnonymous: userData.isAnonymous,
          role: member.role
        };
      })
    );
    
    // Filter out null values (members that couldn't be found)
    return memberProfiles.filter((profile): profile is UserProfile & { role: GroupRole } => profile !== null);
  } catch (error) {
    console.error('Error getting group members:', error);
    throw error;
  }
};
