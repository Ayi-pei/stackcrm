import React from "react";
import { AgentStatus } from "../../types";
import { AGENT_STATUS_CONFIG } from "../../constants/agentStatus";

interface StatusBadgeProps {
  status: AgentStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  showIcon = true,
  showLabel = true,
  className = "",
}) => {
  const config = AGENT_STATUS_CONFIG[status];

  if (!config) {
    return null;
  }

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${sizeClasses[size]} ${className}`}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
    >
      {showIcon && <span>{config.icon}</span>}
      {showLabel && config.label}
    </span>
  );
};
