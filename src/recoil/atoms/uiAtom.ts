import { atom } from "recoil";

export const chatInfoPanelVisibleAtom = atom<boolean>({
    key: "chatInfoPanelVisible",
    default: true, // mặc định hiển thị
});

export const userPanelVisibleAtom = atom<boolean>({
    key: "userPanelVisible",
    default: true,
});

export const userPanelCollapsedAtom = atom({
    key: "userPanelCollapsedAtom",
    default: false, // collapsed = false (rộng) mặc định
});


export const groupModalAtom = atom<boolean>({
    key: "groupModalAtom",
    default: false,
});