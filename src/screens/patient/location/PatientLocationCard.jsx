import { useRef } from 'react'
import { GPS_STATUS, isSharingHere, startSharing, stopSharing, useSharedLocation } from '../../../features/location'
import { Button } from '../../../ui/Button'
import { Icon } from '../../../ui/icons'
import { PATIENT } from '../mockData'

// The patient's own control for location sharing. Browser location belongs to the device the browser
// runs on, so it starts here, on the patient's screen, and only after the patient says yes in the
// dialog. Stopping is always one tap. Nothing starts automatically, and nothing is sent anywhere: in
// this prototype the caregiver view reads what is shared from the same browser's storage.
export function PatientLocationCard() {
  const shared = useSharedLocation()
  const dialogRef = useRef(null)
  const sharing = shared.sharing && isSharingHere()
  const caregiver = PATIENT.caregiver.name

  const problem =
    shared.status === GPS_STATUS.PERMISSION_DENIED
      ? 'Your browser did not allow location. You can change this in the browser settings, then try again.'
      : shared.status === GPS_STATUS.POSITION_UNAVAILABLE || shared.status === GPS_STATUS.UNSUPPORTED
        ? 'Your location is not available right now.'
        : null

  function allow() {
    dialogRef.current?.close()
    startSharing()
  }

  return (
    <section aria-labelledby="location-title" className="rounded-xl bg-surface p-6 shadow-card md:p-8">
      <h2 id="location-title" className="font-heading text-title leading-tight font-bold">
        Location sharing
      </h2>
      <p role="status" className="mt-2 text-lead text-ink-soft">
        {sharing
          ? problem
            ? 'I could not find your location, so nothing is being shared.'
            : shared.position
              ? `Sharing is on. ${caregiver} can see where you are in this demo.`
              : 'Sharing is on. Finding your location…'
          : 'Sharing is off. Nothing is shared unless you choose to.'}
      </p>
      {problem && <p className="mt-2 text-lead font-semibold text-attention-ink">{problem}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {sharing ? (
          <Button variant="secondary" onClick={stopSharing}>
            <Icon name="stop" className="size-6" />
            Stop sharing
          </Button>
        ) : (
          <Button onClick={() => dialogRef.current?.showModal()}>
            <Icon name="check" className="size-6" />
            Share my location
          </Button>
        )}
      </div>
      <p className="mt-4 text-body text-ink-soft">
        This is a prototype. Your location stays in this browser and is shown only on the caregiver page
        of this same browser. Nothing is sent to another device.
      </p>

      <dialog
        ref={dialogRef}
        aria-labelledby="share-title"
        aria-describedby="share-text"
        className="m-auto w-[min(92vw,28rem)] rounded-xl border-0 bg-surface p-gutter text-ink shadow-raised backdrop:bg-ink/60"
      >
        <h2 id="share-title" className="text-title font-bold">
          Share my location with {caregiver}?
        </h2>
        <p id="share-text" className="mt-2 text-lead text-ink-soft">
          Your browser will ask for permission. You can stop sharing at any time. In this demo your
          location is only kept in this browser.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={allow}>Yes, share my location</Button>
          <Button variant="secondary" onClick={() => dialogRef.current?.close()}>
            Not now
          </Button>
        </div>
      </dialog>
    </section>
  )
}
