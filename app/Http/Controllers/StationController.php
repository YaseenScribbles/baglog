<?php

namespace App\Http\Controllers;

use App\Models\Station;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stationSql = DB::table('stations', 's')
            ->join('users as u', 'u.id', '=', 's.created_by')
            ->select(['s.id', 's.name', 's.type', DB::raw('u.name as created_by')]);

        return inertia('Stations', [
            'stations' => fn() => $stationSql->get()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|unique:stations,name',
            'type' => 'required|string'
        ]);

        $data['created_by'] = auth()->user()->id;
        Station::create($data);
        return back()->with('message',  'Station created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(Station $station)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Station $station)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Station $station)
    {
        $data = $request->validate([
            'name' => 'required|string|unique:stations,name,' . $station->id,
            'type' => 'required|string'
        ]);

        $data['modified_by'] = auth()->user()->id;
        $station->update($data);
        return back()->with('message',  'Station created successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Station $station)
    {
        $station->delete();
        return back()->with('message',  $station->name . ' deleted successfully');
    }
}
