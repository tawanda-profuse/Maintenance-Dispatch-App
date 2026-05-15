import { motion } from "framer-motion";
import { Wrench, User } from "lucide-react";

interface Request {
  id: number;
  title: string;
  description: string;
  resident: {
    id: number;
    username: string;
  };
  assigned_to?: {
    id: number;
    username: string;
  };
  status: string;
  created_at: string;
}

interface RequestCardProps {
  request: Request;
}

export default function RequestCard({ request }: RequestCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.01 }} className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{request.title}</h2>

          <p className="text-slate-500 mt-3">{request.description}</p>

          <div className="flex gap-6 mt-5 text-sm text-slate-500">
            <div className="flex items-center gap-2 capitalize">
              <User size={16} />
              {request.resident?.username}
            </div>

            <div className="flex items-center gap-2">
              <Wrench size={16} />
              {request.assigned_to?.username || "Unassigned"}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
