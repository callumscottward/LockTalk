import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

interface Member {
  id: number;
  firstName: string;
  lastName: string;
}

export default function MemberDetails() {
  const { id } = useParams();
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      const response = await fetch(`http://localhost:8000/api/members/${id}`);
      const data = await response.json();
      setMember(data);
    };

    fetchMember();
  }, [id]);

  if (!member) return <p>Loading...</p>;

  return (
    <div>
      <h1>Member Details</h1>
      <p>First Name: {member.firstName}</p>
      <p>Last Name: {member.lastName}</p>
    </div>
  );
}
