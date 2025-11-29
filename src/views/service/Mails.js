
import { Fragment, useEffect, useRef, useState } from "react"


import MailCard from "./MailCard"
import MailDetails from "./MailDetails"


import { formatDateToMonthShort } from "@utils"


import PerfectScrollbar from "react-perfect-scrollbar"
import { useListMutation } from "../../redux/rtkQuery/service"
import LoadSpinner from "../../@core/components/spinner/loaders"
import { useTranslation } from "react-i18next"

const Mails = (props) => {
  
  const {
    openMail,
    selectMail,
    updateMails,
    setOpenMail,
    paginateMail,
    updateMailLabel,
    filters
  } = props
  const {t} = useTranslation()
  const allMailsRef = useRef([])
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)
  const [allMails, setAllMails] = useState([])

  const [hasMore, setHasMore] = useState(true)

  const [isChanged, setIsChanged] = useState(false)
  const [get, { data, isLoading }] = useListMutation()
  useEffect(() => {
    const query = new URLSearchParams({
      per_page: 10,
      page,
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status })
    }).toString()

    get({ filterOptions: query })
  }, [page, filters, isChanged])
  useEffect(() => {
    if (data) {
    const fetchedMails = data.data || []
    const total = data.pagination_data?.total || 0
    const perPage = data.pagination_data?.per_page || 10
    const currentPage = data.pagination_data?.current_page || 1

    if (currentPage === 1) {
      allMailsRef.current = [...fetchedMails]
    } else {
      allMailsRef.current = [...allMailsRef.current, ...fetchedMails]
    }

    setAllMails(allMailsRef.current)

    const totalPages = Math.ceil(total / perPage)
    setHasMore(currentPage < totalPages)
    }
  }, [data])

  useEffect(() => {
    setPage(1)
    setAllMails([])
    allMailsRef.current = []
    setHasMore(true)
  }, [filters])


  const handleScrollY = (container) => {
    const isBottom =
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 100

    if (isBottom && hasMore && !isLoading) {
      setPage((prev) => prev + 1)
    }
  }

  const labelColors = {
    personal: "success",
    company: "primary",
    important: "warning",
    private: "danger"
  }

  
  const handleMailClick = (id) => {
    setSelected(id)
    setOpenMail(true)
  }
  
  const renderMails = () => {
    if (allMails?.length) {
      return allMails?.map((mail, index) => {
        return (
          <MailCard
            mail={mail}
            key={index}
            selectMail={selectMail}
            updateMails={updateMails}
            labelColors={labelColors}
            handleMailClick={handleMailClick}
            formatDateToMonthShort={formatDateToMonthShort}
          />
        )
      })
    }
  }
  console.log("allMails", allMails)

  return (
    <Fragment>
      <div className="email-app-list">
        <div className='app-action'>
          <div className='action-left form-check'>
            <span className='search-results'>
              {data?.pagination_data?.total} {t('Results Found')}
            </span>
          </div>
        </div>
        <PerfectScrollbar
          className="email-user-list"
          options={{ wheelPropagation: false }}
          onScrollY={handleScrollY}
        >
          {isLoading && page === 1 ? (
            <LoadSpinner />
          ) : allMails?.length ? (
              <ul className="email-media-list">
                {renderMails()}
                {isLoading && page > 1 && <LoadSpinner />}
              </ul>
          ) : (
            <div className="no-results d-block">
              <h5>No Items Found</h5>
            </div>
          )}
        </PerfectScrollbar>
      </div>
      <MailDetails
        mail={selected}
        openMail={openMail}
        labelColors={labelColors}
        setOpenMail={setOpenMail}
        updateMails={updateMails}
        paginateMail={paginateMail}
        updateMailLabel={updateMailLabel}
        setIsChanged={setIsChanged}
        formatDateToMonthShort={formatDateToMonthShort}
      />
    </Fragment>
  )
}

export default Mails
