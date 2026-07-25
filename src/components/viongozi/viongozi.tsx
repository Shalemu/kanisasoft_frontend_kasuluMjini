'use client';

import { FaEdit } from 'react-icons/fa';
import ReusableTable from '@/components/tables/ReusableTable';
import Pagination from '@/components/tables/Pagination';
import { useViongozi } from './hooks/useViongozi';

export default function ViongoziPage() {

  const {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    search,
    setSearch,
    filterRole,
    setFilterRole,
    roles,
    setSelectedMemberId,
    currentPage,
    totalPages,
    paginatedLeaders,
    setCurrentPage,
    setEditId,
    editId,
    handleRetireLeader,
    handleRemoveLeader,
    updateLeaderRole,
  } = useViongozi();


  const columns = [

    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          onChange={toggleSelectAll}
        />
      ),

      render: (row:any)=>(
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={()=>toggleSelect(row.id)}
        />
      )
    },


    {
      key:'name',
      label:'Jina',

      render:(row:any)=>(
        <div>
          <div className="font-medium">
            {row.name?.toUpperCase()}
          </div>

          <div className="text-xs text-gray-400">
            {row.email}
          </div>
        </div>
      )
    },


    {
      key:'phone',
      label:'Simu'
    },


    {
      key:'roles',
      label:'Nafasi',

      render:(row:any)=>(
        <div className="flex gap-1 flex-wrap">

          {row.roles?.map(
            (role:string,index:number)=>(
              <span
                key={index}
                className="
                text-xs 
                bg-green-100 
                px-2 
                py-1 
                rounded
                text-green-700
                "
              >
                {role}
              </span>
            )
          )}

        </div>
      )
    },


    {
      key:'actions',
      label:'Hatua',

      render:(row:any)=>(

        <button

          onClick={(e)=>{

            e.stopPropagation();

            setEditId(row.id);

          }}

          className="text-yellow-600"

        >
          <FaEdit/>
        </button>

      )
    }

  ];



return (

<div className="
p-6 
bg-gray-50 
text-gray-800
dark:bg-gray-900
dark:text-white/90
">


<div className="
bg-white
p-5
rounded-xl
shadow
dark:bg-white/[0.03]
">



{/* FILTER */}

<div className="flex gap-3 mb-4">


<input

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

className="
border
p-2
rounded
bg-white
dark:bg-gray-900
"

placeholder="Tafuta..."

 />



<select

value={filterRole}

onChange={(e)=>
setFilterRole(e.target.value)
}

className="
border
p-2
rounded
bg-white
dark:bg-gray-900
"

>


<option value="Yote">
Yote
</option>


{
roles.map((r:any)=>(

<option
key={r.id}
value={r.title}
>

{r.title}

</option>

))
}


</select>


</div>




{/* BULK */}

{
selectedIds.length > 0 &&

<div className="mb-3 flex gap-2">


<button

onClick={handleRetireLeader}

className="
bg-yellow-500
px-3
py-1
rounded
text-white
"

>
Staafu
</button>



<button

onClick={handleRemoveLeader}

className="
bg-red-600
px-3
py-1
rounded
text-white
"

>
Ondoa
</button>


</div>

}




{/* TABLE */}


<ReusableTable

data={paginatedLeaders}

columns={columns}

onRowClick={(row:any)=>{

if(row.user_id){

setSelectedMemberId(row.user_id)

}

}}

/>



<Pagination

currentPage={currentPage}

totalPages={totalPages}

onPageChange={setCurrentPage}

/>



</div>





{/* EDIT ROLE MODAL */}

{
editId &&

<div className="
fixed
inset-0
bg-black/40
flex
items-center
justify-center
">


<div className="
bg-white
p-5
rounded
w-96
dark:bg-gray-900
">


<h2 className="font-bold mb-3">

Hariri Nafasi

</h2>



<select

className="
w-full
border
p-2
rounded
"

onChange={(e)=>

updateLeaderRole(
Number(e.target.value)
)

}

>


<option>
Chagua nafasi
</option>



{
roles.map((r:any)=>(

<option

key={r.id}

value={r.id}

>

{r.title}

</option>

))
}



</select>




<button

onClick={()=>setEditId(null)}

className="
mt-3
bg-gray-500
text-white
px-3
py-1
rounded
"

>

Funga

</button>



</div>


</div>

}


</div>

)

}