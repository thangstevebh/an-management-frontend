import { IAgent } from "@/components/agent/agent-detail";

export interface ICardDetail {
  _id: string;
  cardId: string;
  note: string | null;
  feePercent: string;
  amount: number | any;
  withdrawedAmount: number | any;
  negativeRemainingAmount: number | any;
  withdrawedDate: Date | null;
  fromDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  detail: null | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICard {
  _id: string;
  name: string;
  bankCode: string;
  lastNumber: string;
  defaultFeePercent: number;
  feeBack: number;
  maturityDate: Date | null | string;
  note: string | null;
  agentId: string;
  cardCollaboratorId: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum CommandStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

export interface ICommand {
  _id: string;
  status: CommandStatus;
  cardId: string | ICard;
  agentId: string | IAgent;
  agentDetailId: string | ICardDetail;
  note: string | null;
  code: string;
  incommingAmount: number | any;
  withdrawRequestedAmount: number | any;
  atDate: Date | null;
  createdBy: string | null;
  isConfirmed: false;
  confirmedBy: null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
