import axios from 'axios';
import { ZoomMeeting, ZoomMeetingList, ZoomMeetingOptions, ZoomUser } from '../types';
const ZOOM_API_URL = 'https://api.zoom.us/v2';

export const zoom = {
    meeting: {
        create: async (options: ZoomMeetingOptions) => axios.post<ZoomMeeting>(`${ZOOM_API_URL}/users/me/meetings`, {
            topic: options.topic,
            type: options.type,
            duration: options.duration,
            password: options.password,
        }, {
            headers: {
                Authorization: `Bearer ${options.zoom_token}`,
            }
        }),
        list: async (token: string) => axios.get<ZoomMeetingList>(`${ZOOM_API_URL}/users/me/meetings`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }),
    },
    user: {
        getInfo: async (token: string) => axios.get<ZoomUser>(`${ZOOM_API_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
    }
}