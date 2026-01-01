-- Allow users to update their own applications when status is 'revision_requested'
CREATE POLICY "Users can update own revision_requested applications"
ON public.applications
FOR UPDATE
USING (
  auth.uid() = user_id
  AND status = 'revision_requested'
)
WITH CHECK (
  auth.uid() = user_id
);