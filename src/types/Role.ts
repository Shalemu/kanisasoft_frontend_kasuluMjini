export interface Role {
  id: number;
  title: string;
  requiresMember: boolean | number;
  protected: boolean; // ✅ Add this line
}
