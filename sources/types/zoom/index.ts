import { ZoomMeetingType } from "../../utils/constants";

export type ZoomMeetingOptions = {
    type: ZoomMeetingType;
    topic: string;
    duration: number | null;
    password: string | null;
    zoom_token: string;
}

export type ZoomMeeting = {
    uuid: string;
    id: number;
    host_id: string;
    host_email: string;
    topic: string;
    type: ZoomMeetingType;
    status: string;
    start_time: string;
    duration: number;
    timezone: string;
    created_at: string;
    start_url: string;
    join_url: string;
    password: string;
    h323_password: string;
    pstn_password: string;
    encrypted_password: string;
    settings: {
        host_video: boolean;
        participant_video: boolean;
        cn_meeting: boolean;
        in_meeting: boolean;
        join_before_host: boolean;
        jbh_time: number;
        mute_upon_entry: boolean;
        watermark: boolean;
        use_pmi: boolean;
        approval_type: number;
        audio: string;
        auto_recording: string;
        enforce_login: boolean;
        enforce_login_domains: string;
        alternative_hosts: string;
        close_registration: boolean;
        show_share_button: boolean;
        allow_multiple_devices: boolean;
        registrants_confirmation_email: boolean;
        waiting_room: boolean;
        request_permission_to_unmute_participants: boolean;
        device_testing: boolean;
        focus_mode: boolean;
        private_meeting: boolean;
        email_notification: boolean;
    },
    pre_schedule: boolean;
}

export type ZoomUser = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    type: number;
    role_name: string;
    pmi: number;
    use_pmi: boolean;
    timezone: string;
    dept: string;
    created_at: string;
    last_login_time: string;
    last_client_version: string;
    language: string;
    phone_numbers: ZoomPhoneNumber[];
    vanity_url: string;
    personal_meeting_url: string;
    verified: number;
    pic_url: string;
    cms_user_id: string;
    account_id: string;
    host_key: string;
    status: "pending" | "active" | "inactive";
    group_ids: string[];
    im_group_ids: string[];
    jid: string;
    job_title: string;
    company: string;
    location: string;
    custom_attributes: {
        key: string;
        name: string;
        value: string;
    };
    login_type: number;
    role_id: string;
    plan_united_type: string;
    account_number: number;
    manager: string;
    pronouns: string;
    pronouns_option: number;
}

export type ZoomPhoneNumber = {
    country: string;
    code: string;
    number: string;
    verified: boolean;
    label: "Mobile" | "Office" | "Home" | "Fax";
}

export type ZoomMeetingList = {
    page_count: number;
    page_number: number;
    page_size: number;
    total_records: number;
    meetings: ZoomMeetings[];
}

export type ZoomMeetings = {
    uuid: string;
    id: number;
    host_id: string;
    topic: string;
    type: number;
    start_time: string;
    duration: number;
    timezone: string;
    created_at: string;
    join_url: string;
}